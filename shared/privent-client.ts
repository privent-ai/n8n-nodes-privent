/**
 * The channel this package is, on the wire.
 *
 * The backend's `framework` field names the ORCHESTRATION ENGINE, and both this
 * package and the in-engine interceptor run inside n8n — so both send
 * `framework: "n8n"` and neither is identifiable from it. `X-Privent-Client`
 * carries the channel dimension instead (PRI-183/184), on the transport rather
 * than in the body, because 8 of the 9 endpoints this node calls carry no
 * `framework` and no metadata at all: risk, the vault triple, telemetry,
 * visitor-credentials, custom-patterns and pricing have nowhere to put it.
 *
 * WHAT THE HEADER ADDS, stated as what it excludes (METHOD §6). On
 * `/v1/audit/events` alone a discriminator already exists: every audit event
 * from this package carries `metadata.node_version` and `metadata.core_version`
 * (`privent-http.ts` `buildAuditMetadata`), and the interceptor's `tool_call`
 * envelope carries neither (`privent-n8n@2254a69
 * src/interceptor/tool-call-event.ts:42-49`). So the header is NOT the only way
 * to tell the two apart on audit traffic — it is the only way on everything else.
 *
 * ONE CONSTANT, DELIBERATELY. PRI-183 is not frozen: the value may change before
 * the backend dimension lands, and a value copied to each call site is a value
 * that gets changed in some of them (NP-AK, on the request timeout, in this same
 * package). Spread this object at the call site; do not retype the string.
 *
 * Lives in its own module rather than in `privent-http.ts` so the two credential
 * classes can import it without pulling `@priventai/core` into their bundles —
 * they are 2-3 KB today and `privent-http.ts` is not.
 */
export const PRIVENT_CLIENT_HEADERS = { 'X-Privent-Client': 'n8n-nodes' } as const;
