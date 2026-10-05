# Перевірка (Task A, Task B, бонус E)

- **Інструмент і версія, модель:** Claude Code (desktop app) · Sonnet 5 (`claude-sonnet-5`)
- **ОС і термінал, Node:** macOS 26.2 (Darwin) · zsh · Node v24.15.0

## Task A — сервер в Inspector

- Команди, якими зроблено чотири файли в `docs/mcp/` — рівно як у walkthrough, з кореня репозиторію:

  ```bash
  npx -y @modelcontextprotocol/inspector@2.8.0 --cli node mcp/leaddesk-server/src/server.mjs \
    --method tools/list > docs/mcp/tools-list.json

  npx -y @modelcontextprotocol/inspector@2.8.0 --cli node mcp/leaddesk-server/src/server.mjs \
    --method tools/call --tool-name leaddesk_set_lead_status \
    --tool-arg leadId=lead_0002 --tool-arg status=contacted --tool-arg "reason=перевірка в Inspector" > docs/mcp/set-status.json

  npx -y @modelcontextprotocol/inspector@2.8.0 --cli node mcp/leaddesk-server/src/server.mjs \
    --method tools/call --tool-name leaddesk_set_lead_status \
    --tool-arg leadId=nope --tool-arg status=won --tool-arg reason=ok > docs/mcp/bad-input.json   # exit=5

  npx -y @modelcontextprotocol/inspector@2.8.0 --cli node mcp/leaddesk-server/src/server.mjs \
    --method resources/read --uri leaddesk://reference/statuses > docs/mcp/resource-read.json
  ```

- `tools-list.json`: рівно два інструменти — `leaddesk_find_leads` (`readOnlyHint: true`) і
  `leaddesk_set_lead_status` (`readOnlyHint: false`). У `leaddesk_find_leads` модель бачить опис
  параметра `status` (який статус шукати серед `new/contacted/qualified/won/lost`, `any` — усі) і
  `limit` (1–50, за замовчуванням 10). У `leaddesk_set_lead_status` — опис `leadId` (формат
  `lead_0001`), `status` (без `any`) і `reason` (3–500 символів), а опис самого інструмента прямо
  каже, що він змінює дані й перед викликом потрібне підтвердження людини.
- `bad-input.json`: ламали `leaddesk_set_lead_status` одразу двома полями —
  `leadId=nope` (не збігається з `^lead_\d{4}$`) і `reason=ok` (коротше 3 символів). Текст помилки:
  `Invalid arguments for tool leaddesk_set_lead_status: leadId: Invalid string: must match pattern
  /^lead_\d{4}$/, reason: Too small: expected string to have >=3 characters`. Inspector завершився
  кодом **5**, `isError: true` — рівно 1 входження в файлі.
- `set-status.json`: лід `lead_0002` (компанія Rynok Books), статус змінено з `new` на `contacted`.
  Запис аудиту: `{ "action": "status:new->contacted", "leadId": "lead_0002", "at": "<ISO-час
  виклику>", "reason": "перевірка в Inspector" }`.
- Що було найважче в описах інструментів і параметрів: чесно розмежувати, що потрібно моделі
  (`leaddesk_find_leads` не повертає ім'я, email і текст заявки — цих полів немає навіть у схемі
  відповіді) від того, що потрібно людині для аудиту (`reason` обов'язковий і з мінімальною
  довжиною, щоб запис в аудиті був осмисленим, а не порожнім рядком). Друге — сформулювати семантику
  п'яти статусів у ресурсі `leaddesk://reference/statuses` так, щоб вона справді відповідала на
  «коли саме» й «хто», а не повторювала назви статусів.

Самоперевірка (усі пройшли):

```bash
node -e "const t=require('./docs/mcp/tools-list.json').tools; for (const x of t) console.log(x.name, JSON.stringify(x.annotations))"
# leaddesk_find_leads {"readOnlyHint":true}
# leaddesk_set_lead_status {"readOnlyHint":false}

grep -c '"isError": true' docs/mcp/bad-input.json          # 1
grep -o '"action"\|"leadId"\|"at"' docs/mcp/set-status.json | sort -u   # "action" "at" "leadId"
grep -rc 'console\.log' mcp/leaddesk-server/src             # server.mjs:0
cmp materials/leads.json mcp/leaddesk-server/fixtures/leads.json && echo "fixture = materials/leads.json"
```

## Task B — що зробили агенти з серверами

- **Supabase:** <TODO>
- **Vercel:** <TODO>
- **Figma:** <TODO>
- **Playwright:** <TODO>
- Що агент зробив сам, без прохання: <TODO>

## Task E (бонус)

- Варіант: <TODO — чи робимо E1/E2/E3>
- <TODO>
