// LeadDesk MCP server — two business verbs instead of SQL over the whole database.
//
//   node src/server.mjs                                       default fixture
//   LEADDESK_FIXTURE=/path/to/leads.json node src/server.mjs   a different fixture (for A/B runs)
//
// Data is held in process memory; fixtures/leads.json is never rewritten.
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const FIXTURE = process.env.LEADDESK_FIXTURE ?? fileURLToPath(new URL("../fixtures/leads.json", import.meta.url));

const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"];

const STATUSES_MARKDOWN = `# LeadDesk lead statuses

- \`new\` — the request just came in, nobody has contacted this lead yet. Starting status for every new submission.
- \`contacted\` — a manager reached the lead (call, email, or message) and confirmed the contact is live.
  Move here right after the first call, regardless of its outcome.
- \`qualified\` — the call confirmed a real budget and a genuine need for the service: the lead is ready
  for a commercial proposal. Never assign this status without a confirmed budget, even if the lead seems interested.
- \`won\` — the client signed a deal or paid an invoice. Only the deal owner (the manager who ran the
  negotiation) moves a lead here, after confirming payment or a signed contract.
- \`lost\` — the lead declined, stopped responding for over two weeks, or didn't fit the budget/niche. Always
  record the reason in the audit entry's \`reason\` field so the team can see why the deal fell through.
`;

const leads = JSON.parse(await readFile(FIXTURE, "utf8"));
const audit = [];

function findLead(leadId) {
  return leads.find((lead) => lead.id === leadId);
}

function fail(text) {
  return { isError: true, content: [{ type: "text", text }] };
}

function publicLead(lead) {
  const { id, company, status, source, budget, createdAt } = lead;
  return { id, company, status, source, budget, createdAt };
}

const factory = () => {
  const server = new McpServer({ name: "leaddesk", version: "0.1.0" });

  server.registerTool(
    "leaddesk_find_leads",
    {
      title: "Find leads",
      description:
        "Returns LeadDesk leads filtered by status, newest first. Read-only. The response never includes " +
        "the lead's name, email, or message text — only company, status, source, budget, and createdAt.",
      inputSchema: {
        status: z.enum([...LEAD_STATUSES, "any"]).describe("Which status to search for among new, contacted, qualified, won, lost; any — every status"),
        limit: z.number().int().min(1).max(50).default(10).describe("How many leads to return, from 1 to 50. Defaults to 10"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ status, limit }) => {
      const filtered = status === "any" ? leads : leads.filter((lead) => lead.status === status);
      const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const page = sorted.slice(0, limit).map(publicLead);
      return {
        content: [{ type: "text", text: `Found ${page.length} lead(s) with status "${status}" (showing at most ${limit}).` }],
        structuredContent: { leads: page },
      };
    },
  );

  server.registerTool(
    "leaddesk_set_lead_status",
    {
      title: "Set lead status",
      description:
        "Changes a LeadDesk lead's status and adds an audit entry. This changes process data: before calling, " +
        "make sure a human has confirmed this exact status change for this exact lead.",
      inputSchema: {
        leadId: z
          .string()
          .regex(/^lead_\d{4}$/)
          .describe("Lead identifier in the lead_0001 format, e.g. lead_0002"),
        status: z.enum(LEAD_STATUSES).describe("New status: new, contacted, qualified, won, or lost"),
        reason: z.string().min(3).max(500).describe("Why the status is changing, 3–500 characters"),
      },
      annotations: { readOnlyHint: false },
    },
    async ({ leadId, status, reason }) => {
      const lead = findLead(leadId);
      if (!lead) {
        return fail(`Lead "${leadId}" was not found. Look up the correct id with leaddesk_find_leads first.`);
      }
      if (lead.status === status) {
        return fail(`Lead "${leadId}" already has status "${status}". No change needed.`);
      }

      const previousStatus = lead.status;
      lead.status = status;
      const entry = {
        action: `status:${previousStatus}->${status}`,
        leadId,
        at: new Date().toISOString(),
        reason,
      };
      audit.push(entry);

      return {
        content: [{ type: "text", text: `Changed "${leadId}" status from "${previousStatus}" to "${status}". Reason: ${reason}` }],
        structuredContent: { lead: publicLead(lead), audit: entry },
      };
    },
  );

  server.registerResource(
    "leaddesk-statuses",
    "leaddesk://reference/statuses",
    {
      title: "LeadDesk lead statuses",
      description: "The five lead statuses and what each means for the team: when to assign it and who does",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: STATUSES_MARKDOWN }],
    }),
  );

  return server;
};

await serveStdio(factory);
