import type {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
  Icon,
} from 'n8n-workflow';

/**
 * Tokenless (Visitor) credential. No API key: the node mints an anonymous
 * signed `X-Visitor-Id` against the backend and attaches it itself (Step 3).
 * Only the backend base URL is configurable here.
 */
export class PriventVisitorApi implements ICredentialType {
  name = 'priventVisitorApi';
  displayName = 'Privent Tokenless';
  documentationUrl = 'https://www.privent.ai/docs';
  icon: Icon = 'file:privent.png';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.privent.ai',
      description:
        'Privent backend base URL. Tokenless mode mints an anonymous visitor id against it — the backend must have visitor auth enabled.',
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
    },
  };
}
