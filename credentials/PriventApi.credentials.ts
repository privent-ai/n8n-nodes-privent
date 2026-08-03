import type {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
  Icon,
} from 'n8n-workflow';
import { PRIVENT_CLIENT_HEADERS } from '../shared/privent-client.js';

export class PriventApi implements ICredentialType {
  name = 'priventApi';
  displayName = 'Privent API';
  documentationUrl = 'https://www.privent.ai/docs';
  icon: Icon = 'file:../nodes/privent.png';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description:
        'Your Privent API key (starts with pv_live_…). Find it in the Privent dashboard under Settings → API Keys.',
      hint: 'This value is encrypted at rest by n8n and never written to workflow output or logs.',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.privent.ai',
      description:
        'Where this credential sends token, risk and audit traffic. Left unchanged it points at Privent Cloud — self-hosted deployments must set their own URL. Clearing the field is refused rather than silently sent to.',
    },
    {
      displayName: 'Vault Backend',
      name: 'vaultBackend',
      type: 'options',
      options: [
        {
          name: 'In-Memory (Recommended for self-hosted n8n)',
          value: 'memory',
          description:
            'Tokens are stored in the worker process memory for the duration of the execution. Fast, zero-latency lookups.',
        },
        {
          name: 'Privent Cloud (Recommended for n8n Cloud)',
          value: 'cloud',
          description:
            'Tokens are stored in Privent Cloud. Required when executions span multiple worker processes.',
        },
      ],
      default: 'memory',
      description:
        'Where session tokens are stored. Use Cloud backend on n8n Cloud or when running n8n with multiple queue workers.',
    },
  ];

  // n8n uses this to attach the Authorization header automatically on any
  // node that declares `credentials: [{ name: 'priventApi', required: true }]`.
  authenticate = {
    type: 'generic' as const,
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  // n8n calls this endpoint to validate the credential in the UI.
  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/v1/health',
      method: 'GET',
      headers: { ...PRIVENT_CLIENT_HEADERS },
    },
  };
}
