# leaddesk-mcp-server

MCP server for LeadDesk: two business verbs instead of SQL over the whole database. Two entrypoints
share the same tools/resource (`src/factory.mjs`): `src/server.mjs` over stdio (the required mode)
and `src/http.mjs` over HTTP with Host/Origin validation (Task E1, bonus). Data comes from
`fixtures/leads.json` (a frozen copy of `materials/leads.json`, 20 leads) and is held only in the
process's memory — the fixture file itself is never rewritten.

## Tools and resource

| Name | Kind | What it does |
|---|---|---|
| `leaddesk_find_leads` | tool, read-only | Leads filtered by status, newest first. Returns only `id, company, status, source, budget, createdAt` — no name, email, or message text. |
| `leaddesk_set_lead_status` | tool, writes | Changes a lead's status and appends an audit entry `{ action, leadId, at, reason }`. Rejects an unknown `leadId` or a no-op (same-status) change. |
| `leaddesk://reference/statuses` | resource, `text/markdown` | What each of the five statuses means for the team and who moves a lead into it. |

## Run it

```bash
(cd mcp/leaddesk-server && npm install)   # once
node mcp/leaddesk-server/src/server.mjs   # from repo root; speaks MCP over stdio
```

A different fixture (used for the Task C A/B comparison) can be pointed to with:

```bash
LEADDESK_FIXTURE=/path/to/leads.json node mcp/leaddesk-server/src/server.mjs
```

## Verify with the MCP Inspector

From the repo root:

```bash
npx -y @modelcontextprotocol/inspector@2.8.0 --cli node mcp/leaddesk-server/src/server.mjs --method tools/list

npx -y @modelcontextprotocol/inspector@2.8.0 --cli node mcp/leaddesk-server/src/server.mjs \
  --method tools/call --tool-name leaddesk_set_lead_status \
  --tool-arg leadId=lead_0002 --tool-arg status=contacted --tool-arg "reason=manual check"

npx -y @modelcontextprotocol/inspector@2.8.0 --cli node mcp/leaddesk-server/src/server.mjs \
  --method resources/read --uri leaddesk://reference/statuses
```

Each invocation restarts the server, so state is fresh every time (`lead_0002` is back to `new`).
See [`docs/mcp/verification.md`](../../docs/mcp/verification.md) for the full self-check and the
captured artifacts in `docs/mcp/*.json`.

## Connect to Claude Code

From the repo root, local scope (not committed to git):

```bash
claude mcp add leaddesk -- node mcp/leaddesk-server/src/server.mjs
```

For the Task C A/B comparison, the server is instead added from an empty directory outside the
repo, with an absolute path to `src/server.mjs` — see `docs/walkthrough.md`, Task C.

## HTTP mode (Task E1, bonus)

```bash
node mcp/leaddesk-server/src/http.mjs   # listens on 127.0.0.1:3333/mcp only
```

`toNodeHandler` (from `@modelcontextprotocol/node`) doesn't take the Host/Origin guards as an
option — passing them that way is silently ignored, so they're invoked explicitly in `http.mjs`
before the request reaches the MCP handler. Evidence (4 `curl` checks — normal request, spoofed
`Host`, spoofed `Origin`, missing `Mcp-Method` header) is in
[`docs/mcp/evidence/e1-http-curl.txt`](../../docs/mcp/evidence/e1-http-curl.txt).
