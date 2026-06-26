"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/credentials/PriventApi.credentials.ts
var PriventApi_credentials_exports = {};
__export(PriventApi_credentials_exports, {
  PriventApi: () => PriventApi
});
module.exports = __toCommonJS(PriventApi_credentials_exports);
var PriventApi = class {
  name = "priventApi";
  displayName = "Privent API";
  documentationUrl = "https://www.privent.ai/docs";
  icon = "file:privent.png";
  properties = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      description: "Your Privent API key (starts with pv_live_\u2026). Find it in the Privent dashboard under Settings \u2192 API Keys.",
      hint: "This value is encrypted at rest by n8n and never written to workflow output or logs."
    },
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://api.privent.ai",
      description: "Privent Cloud API base URL. Override only for self-hosted Privent deployments."
    },
    {
      displayName: "Vault Backend",
      name: "vaultBackend",
      type: "options",
      options: [
        {
          name: "In-Memory (Recommended for self-hosted n8n)",
          value: "memory",
          description: "Tokens are stored in the worker process memory for the duration of the execution. Fast, zero-latency lookups."
        },
        {
          name: "Privent Cloud (Recommended for n8n Cloud)",
          value: "cloud",
          description: "Tokens are stored in Privent Cloud. Required when executions span multiple worker processes."
        }
      ],
      default: "memory",
      description: "Where session tokens are stored. Use Cloud backend on n8n Cloud or when running n8n with multiple queue workers."
    }
  ];
  // n8n uses this to attach the Authorization header automatically on any
  // node that declares `credentials: [{ name: 'priventApi', required: true }]`.
  authenticate = {
    type: "generic",
    properties: {
      headers: {
        Authorization: "=Bearer {{$credentials.apiKey}}"
      }
    }
  };
  // n8n calls this endpoint to validate the credential in the UI.
  test = {
    request: {
      baseURL: "={{$credentials.baseUrl}}",
      url: "/v1/health",
      method: "GET"
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PriventApi
});
//# sourceMappingURL=PriventApi.credentials.js.map