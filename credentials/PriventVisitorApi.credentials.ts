import type {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
  Icon,
} from 'n8n-workflow';
import { PRIVENT_CLIENT_HEADERS } from '../shared/privent-client.js';

/**
 * Tokenless (Visitor) credential. No API key: the node mints an anonymous
 * signed `X-Visitor-Id` against the backend and attaches it itself (Step 3).
 * Only the backend base URL is configurable here.
 */
export class PriventVisitorApi implements ICredentialType {
  name = 'priventVisitorApi';
  displayName = 'Privent Tokenless API';
  documentationUrl = 'https://www.privent.ai/docs';
  icon: Icon = 'file:../nodes/privent.png';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.privent.ai',
      description:
        'Where Tokenless mode mints its anonymous visitor id and sends risk and telemetry traffic. Left unchanged it points at Privent Cloud — self-hosted deployments must set their own URL. The backend must have visitor auth enabled.',
    },
  ];

  // n8n calls this to validate the credential in the UI. 200 = tokenless
  // enabled; 404 = backend flag off (test fails — the correct signal). This
  // mints a throwaway visitor token per test; the endpoint is rate-limited.
  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/v1/visitor/credentials',
      method: 'POST',
      body: {},
      headers: { ...PRIVENT_CLIENT_HEADERS },
    },
  };
}
