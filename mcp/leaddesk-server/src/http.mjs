// LeadDesk MCP server — HTTP entrypoint (Task E1, bonus). Same factory as server.mjs.
//
//   node src/http.mjs   listens on 127.0.0.1:3333
//
// The Host/Origin guards must be invoked explicitly: passing them as a toNodeHandler
// option is silently ignored, and the server would answer 200 to a spoofed Host.
import { createServer } from "node:http";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler, localhostHostValidation, localhostOriginValidation } from "@modelcontextprotocol/node";
import { factory } from "./factory.mjs";

const mcp = toNodeHandler(createMcpHandler(factory));
const checkHost = localhostHostValidation();
const checkOrigin = localhostOriginValidation();

createServer(async (req, res) => {
  if (!checkHost(req, res)) return; // guard already answered 403
  if (!checkOrigin(req, res)) return;
  await mcp(req, res);
}).listen(3333, "127.0.0.1", () => {
  console.error("leaddesk http server listening on http://127.0.0.1:3333/mcp");
});
