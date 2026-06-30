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

// credentials/PriventVisitorApi.credentials.ts
var PriventVisitorApi_credentials_exports = {};
__export(PriventVisitorApi_credentials_exports, {
  PriventVisitorApi: () => PriventVisitorApi
});
module.exports = __toCommonJS(PriventVisitorApi_credentials_exports);
var PriventVisitorApi = class {
  name = "priventVisitorApi";
  displayName = "Privent Tokenless";
  documentationUrl = "https://www.privent.ai/docs";
  icon = "file:privent.png";
  properties = [
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://api.privent.ai",
      description: "Privent backend base URL. Tokenless mode mints an anonymous visitor id against it \u2014 the backend must have visitor auth enabled."
    }
  ];
  // n8n calls this to validate the credential in the UI. 200 = tokenless
  // enabled; 404 = backend flag off (test fails — the correct signal). This
  // mints a throwaway visitor token per test; the endpoint is rate-limited.
  test = {
    request: {
      baseURL: "={{$credentials.baseUrl}}",
      url: "/v1/visitor/credentials",
      method: "POST",
      body: {}
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PriventVisitorApi
});
//# sourceMappingURL=PriventVisitorApi.credentials.js.map