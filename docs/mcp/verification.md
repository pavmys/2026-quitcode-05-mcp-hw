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

- **Supabase:** нова сесія, у `/mcp` увімкнено лише `supabase` (9 інструментів). Агент зробив рівно
  чотири виклики, усі схвалено вручну, нічого не відхилено:
  1. `apply_migration` — створив `public.leads` (поля за `materials/leads.json`, `status` з
     `check`-обмеженням на 5 значень, RLS увімкнено без жодної policy) →
     `supabase/migrations/0001_leaddesk.sql`.
  2. `execute_sql` — один `insert` на 20 рядків (`lead_0001`–`lead_0020`, ті самі дані, що в
     `materials/leads.json`) → той самий SQL збережено в `supabase/seed/leads.sql`.
  3. `list_migrations` — перевірка, що міграція застосувалась.
  4. `execute_sql` — опціональний запит `select current_user, session_user,
     current_setting('is_superuser');`. Результат: `current_user = postgres`, `session_user =
     postgres`, `is_superuser = off`. Формально не суперкористувач, але роль володіє схемою
     `public` (тому й змогла виконати міграцію) і має `BYPASSRLS` — RLS на `leads` блокує лише
     публічні ролі `anon`/`authenticated`, агента через MCP не обмежує нічим. count(*) з таблиці
     підтверджено вручну через дашборд Supabase — 20 рядків.
- **Vercel:** форк підключено до нового проєкту Vercel через git-інтеграцію в дашборді (не через
  `deploy_to_vercel`). Деплой зібрався автоматично з `main`, коміт `958d2ee`, production, стан
  `READY`. Запит до агента: «Знайди останній деплой мого проєкту LeadDesk у Vercel і покажи лог його
  білду. Нічого не деплой і не змінюй». Агент викликав лише інструменти читання:
  `list_projects` → `list_teams` (щоб знайти скоуп) → `list_projects` у скоупі →
  `list_deployments` (`limit: 1`) → `list_deployment_events` (`builds: 1`, `limit: -1`). З цього
  ланцюжка в `allow` є лише `list_deployments`; решту чотири схвалено вручну по одному, бо вони не
  потрапляють ні в `allow`, ні в `deny`. Жодного інструмента, що змінює стан, не викликано. Інструменту
  `get_deployment_build_logs` із нашого `allow` цей сервер не надає: лог прийшов через
  `list_deployment_events`. Перша спроба нічого не знайшла, бо OAuth-сесія була прив'язана до
  іншого акаунта Vercel. Після `/mcp` → очищення автентифікації й повторного входу проєкт знайшовся.
  Лог → `docs/mcp/evidence/vercel-build-log.txt`: власника/репозиторій і назву пакета замінено на
  `<redacted>`, ID команди/проєкту/деплою й URL `*.vercel.app` прибрано. Що в лозі: білд у `iad1`
  (2 cores, 8 GB) без кешу; `npm install` — 493 пакети з попередженнями про застарілі `rimraf`,
  `glob`, `inflight`, `eslint@9.39.5` і про несхвалений postinstall `unrs-resolver`; Next.js 16.3.5
  (Turbopack) скомпілював за 7.7 с, TypeScript — 2.5 с; 8 статичних сторінок, серед них журнал
  застосунку `db:listUsers: 1`; маршрути `/`, `/login`, `/quotes/new` статичні, `/api/leads`,
  `/api/n8n/[event]`, `/dashboard`, `/dashboard/leads/[id]`, `/quotes/[id]` динамічні, плюс Proxy
  (Middleware). «Build Completed [21s]», деплой ~40 с разом із кешем 165 MB.
- **Playwright:** <TODO>
- Що агент зробив сам, без прохання: після запиту про роль сам пояснив, що `postgres` обходить RLS
  і володіє схемою, і запропонував дописати `&read_only=true` в `.mcp.json`, попередньо сказавши,
  що сам файл не чіпатиме без явного «так». Пропозицію не прийняли: профіль «build» навмисно без
  `read_only=true` (інакше `apply_migration` недоступний), а звужений `read_only=true`-профіль —
  окремий URL для Task C, не для цього `.mcp.json`. У сесії Vercel агент сам викликав
  `list_teams`, коли пошук проєкту в особистому скоупі нічого не дав. Так радить інструкція
  вендора «discover teams then projects». Результат лишився в чаті, у файли не потрапив.

## Task E (бонус)

- Варіант: <TODO — чи робимо E1/E2/E3>
- <TODO>
