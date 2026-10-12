// LeadDesk MCP server — stdio entrypoint. Two business verbs instead of SQL over the whole database.
//
//   node src/server.mjs                                       default fixture
//   LEADDESK_FIXTURE=/path/to/leads.json node src/server.mjs   a different fixture (for A/B runs)
//
// See factory.mjs for the tools/resource themselves, and http.mjs for the HTTP entrypoint (Task E1).
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { factory } from "./factory.mjs";

await serveStdio(factory);
