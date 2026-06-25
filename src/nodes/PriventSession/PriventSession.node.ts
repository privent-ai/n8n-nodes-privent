import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import type { AuditEvent } from '@priventai/core';
import { TRACER_VERSION } from '@priventai/core';
import {
  auditLog,
  buildAuditMetadata,
  getPriventBaseUrl,
  isUuid,
  safeExecutionId,
  safeFrameworkVersion,
  safeTriggerMode,
  safeWorkflow,
} from '../../shared/privent-http.js';

export class PriventSession implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Privent Session',
    name: 'priventSession',
    icon: 'file:privent.png',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["sessionIdMode"]}}',
    description:
      'Opens a Privent session vault at the start of your workflow. Place this node before any Privent Tokenize nodes. The sessionId output must be passed to all downstream Privent nodes.',
    defaults: { name: 'Privent Session' },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: 'priventApi', required: true }],
    properties: [
      {
        displayName: 'Session ID Mode',
        name: 'sessionIdMode',
        type: 'options',
        options: [
          {
            name: 'Auto-Generate (Recommended)',
            value: 'auto',
            description: 'A new UUID is generated for each workflow execution',
          },
          {
            name: 'Manual',
            value: 'manual',
            description: 'Supply your own session ID (useful for resuming a session)',
          },
        ],
        default: 'auto',
      },
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '',
        required: true,
        description: 'A stable string that identifies this session',
        displayOptions: { show: { sessionIdMode: ['manual'] } },
      },
      {
        displayName: 'Agent Name',
        name: 'agentName',
        type: 'string',
        default: '',
        description:
          'Logical agent identifier written to the output item and forwarded to downstream Privent nodes (via their Agent Name expression default). Appears in every audit event as metadata.agent_name.',
        hint: 'Optional. Example: "support-bot", "billing-agent". Leave empty if not modeling distinct agents.',
      },
      {
        displayName: 'Framework',
        name: 'framework',
        type: 'options',
        options: [
          { name: 'n8n', value: 'n8n' },
          { name: 'Manual / Custom', value: 'manual' },
        ],
        default: 'n8n',
        description: 'Identifies the orchestration framework in audit logs',
      },
      {
        displayName: 'Webhook Node Name',
        name: 'webhookNodeName',
        type: 'string',
        default: 'Webhook',
        description:
          'Optional. Name of an upstream Webhook trigger node. When set, the SDK auto-extracts client IP and User-Agent from its headers and writes them to agent_sessions (trigger_principal_ip, trigger_principal_user_agent).',
        hint: 'Leave default if your workflow does not start with a Webhook trigger; parse failures are silent.',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const baseUrl = await getPriventBaseUrl(this);
    const framework =
      (this.getNodeParameter('framework', 0, 'n8n') as string) === 'manual' ? 'manual' : 'n8n';
    const triggerMode = safeTriggerMode(this);
    const { id: workflowId, name: workflowName } = safeWorkflow(this);
    const executionId = safeExecutionId(this);

    const out: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      try {
        const mode = this.getNodeParameter('sessionIdMode', i) as 'auto' | 'manual';
        const sessionId =
          mode === 'manual'
            ? (this.getNodeParameter('sessionId', i) as string).trim()
            : crypto.randomUUID();

        if (!sessionId) {
          throw new NodeOperationError(
            this.getNode(),
            'Session ID cannot be empty in manual mode',
            { itemIndex: i },
          );
        }
        if (mode === 'manual' && !isUuid(sessionId)) {
          throw new NodeOperationError(
            this.getNode(),
            'Manual Session ID must be a UUID — auto mode generates one',
            { itemIndex: i },
          );
        }

        const traceId = crypto.randomUUID();
        const agentNameParam = (this.getNodeParameter('agentName', i, '') as string).trim();
        const agentName = agentNameParam || workflowName || '';
        const startedAt = Date.now();

        // Cloud vault is lazy — no pre-warm needed. Correlation context travels
        // on the output item (below) instead of a process-global registry.

        // C-2: pull client IP / User-Agent from an upstream Webhook trigger.
        // Best-effort: missing node, missing headers, or expression errors all
        // collapse to undefined so the workflow never breaks on parse failure.
        let triggerPrincipalIp: string | undefined;
        let triggerPrincipalUserAgent: string | undefined;
        const webhookNodeName = (
          this.getNodeParameter('webhookNodeName', i, 'Webhook') as string
        ).trim();
        if (webhookNodeName) {
          try {
            const headersExpr = `={{$("${webhookNodeName}").first().json.headers}}`;
            const headers = this.evaluateExpression(headersExpr, i) as
              | Record<string, unknown>
              | undefined;
            if (headers && typeof headers === 'object') {
              const lower: Record<string, string> = {};
              for (const [k, v] of Object.entries(headers)) {
                if (typeof v === 'string') lower[k.toLowerCase()] = v;
              }
              // Fallback chain ordered from most to least specific. First
              // populated header wins — `x-forwarded-for` may carry a list
              // (proxy chain); the original client is the leftmost entry.
              const ipChain = [
                'x-forwarded-for',
                'cf-connecting-ip',
                'x-real-ip',
                'x-client-ip',
              ];
              for (const h of ipChain) {
                const raw = lower[h];
                if (raw) {
                  const first = raw.split(',')[0]?.trim();
                  if (first) {
                    triggerPrincipalIp = first;
                    break;
                  }
                }
              }
              if (lower['user-agent']) {
                triggerPrincipalUserAgent = lower['user-agent'].slice(0, 500);
              }
            }
          } catch {
            // No upstream Webhook node, or the expression failed — skip silently.
          }
        }

        const node = this.getNode();
        const auditCtx = {
          sessionId,
          traceId,
          executionId,
          agentName,
          workflowId,
          workflowName,
        };
        const sessionOpen: AuditEvent = {
          type: 'session_open',
          traceId,
          sessionId,
          timestamp: startedAt,
          framework,
          workflowId,
          nodeId: node.id,
          metadata: buildAuditMetadata(auditCtx, node, {
            session_id_mode: mode,
            framework_version: safeFrameworkVersion() ?? TRACER_VERSION,
            ...(triggerMode !== undefined ? { trigger_mode: triggerMode } : {}),
            ...(triggerPrincipalIp !== undefined
              ? { trigger_principal_ip: triggerPrincipalIp }
              : {}),
            ...(triggerPrincipalUserAgent !== undefined
              ? { trigger_principal_user_agent: triggerPrincipalUserAgent }
              : {}),
          }),
        };
        void auditLog(this, sessionOpen, baseUrl);

        out.push({
          json: {
            ...item.json,
            sessionId,
            traceId,
            startedAt,
            executionId,
            agentName,
          },
          pairedItem: { item: i },
        });
      } catch (err) {
        if (this.continueOnFail()) {
          out.push({ json: { error: (err as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw err;
      }
    }

    return [out];
  }
}
