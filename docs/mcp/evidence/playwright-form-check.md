# Playwright MCP — перевірка форми заявки на localhost:3000

Дата: 2026-10-11 (час — EEST, локальний час машини).

## Промпт

> Відкрий http://localhost:3000, заповни форму заявки тестовими даними, відправ, перевір консоль і
> мережу. Інших адрес не відкривай. Кожен запит і те що ти робитимеш - записуй в файл
> docs/mcp/evidence/playwright-form-check.md . Кожен запис має містити: промпт (запис), tool-call
> який ти використав, коли була засабмічена форма, що з'являлося в консолі та в Network табі.

## Передумови (12:38:13)

- MCP-сервери в цій сесії: лише `playwright` (`@playwright/mcp@0.0.82`, `--isolated`, `--no-webmcp`,
  `--allowed-origins http://localhost:3000`). Supabase і Vercel у цій сесії не підключені — правило
  «браузерний сервер ніколи не працює в одній сесії із Supabase» дотримано.
- Dev-сервер: `node` (PID 46472) слухає `*:3000` — перевірено `lsof -nP -iTCP:3000 -sTCP:LISTEN`.
- У браузер ніде не логінюсь; відкриваю лише `http://localhost:3000`.

## Журнал кроків

### Крок 1 — відкрити головну сторінку (09:38:25 UTC / 12:38:25 EEST)

- **Запис (що роблю):** відкриваю `http://localhost:3000`, знімаю accessibility-снапшот, щоб знайти
  форму заявки, і фіксую стартовий стан консолі та мережі.
- **Tool-calls:**
  - `mcp__playwright__browser_navigate({ url: "http://localhost:3000" })` → `page.goto('http://localhost:3000')`,
    Page URL `http://localhost:3000/`, Title `LeadDesk`.
  - `mcp__playwright__browser_snapshot({})`
  - `mcp__playwright__browser_console_messages({ level: "debug" })`
  - `mcp__playwright__browser_network_requests({ static: false })`, потім `({ static: true })`
- **Форма засабмічена:** ні (лише відкриття сторінки).
- **Що знайдено на сторінці:** форма «Розкажіть про ваш проєкт» з полями `Ім'я` (e21), `Прізвище` (e23),
  `Email` (e26), `Телефон` (e28), `Компанія` (e31), `Сайт` (e33, placeholder `https://`), `Бюджет`
  (combobox e35, за замовчуванням «Ще не визначились»), `Що потрібно зробити?` (e37), чекбокс
  розсилки (e39), кнопка `Надіслати заявку` (e40). Порожній `alert` (e41) — регіон для повідомлень.
- **Консоль (2 повідомлення, 0 errors, 0 warnings):**
  - `[INFO] Download the React DevTools for a better development experience: https://react.dev/link/react-devtools`
  - `[LOG] [HMR] connected`
- **Network:** без статики — 0 запитів. Зі статикою — 21 запит, усі `GET` на `http://localhost:3000`,
  усі `200 OK`:
  - `GET /` → 200
  - 4 × шрифти `/_next/static/media/*.woff2` → 200
  - 1 × CSS `/_next/static/chunks/[root-of-the-server]__110zi9y._.css` → 200
  - 14 × JS-чанки `/_next/static/chunks/*.js` (react-dom, next-devtools, HMR-клієнт turbopack тощо) → 200
  - `GET /favicon.ico?favicon.2vob68tjqpejf.ico` → 200
  - Запитів на інші адреси немає.

### Крок 2 — заповнити форму тестовими даними (12:38:26–12:38:57 EEST)

- **Запис (що роблю):** заповнюю всі текстові поля і бюджет синтетичними даними (домен
  `example.com`, телефон-заглушка). Чекбокс розсилки залишаю порожнім — тестовий лід не має
  підписуватися на маркетинг. Потім перевіряю, що значення стоять у полях.
- **Tool-calls:**
  - `mcp__playwright__browser_fill_form({ fields: [...] })` → Playwright виконав:
    ```js
    await page.getByRole('textbox', { name: 'Ім\'я' }).fill('Тест');
    await page.getByRole('textbox', { name: 'Прізвище' }).fill('Playwright');
    await page.getByRole('textbox', { name: 'Email' }).fill('test.playwright@example.com');
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+380000000000');
    await page.getByRole('textbox', { name: 'Компанія' }).fill('Test Company (MCP check)');
    await page.getByRole('textbox', { name: 'Сайт' }).fill('https://example.com');
    await page.getByLabel('БюджетЩе не визначилисьдо $').selectOption('$500–1500 / міс.');
    await page.getByRole('textbox', { name: 'Що потрібно зробити?' }).fill('Тестова заявка від Playwright MCP для перевірки форми. Не обробляти.');
    ```
  - `mcp__playwright__browser_snapshot({ target: "e18" })` — перевірка значень у формі.
  - `mcp__playwright__browser_console_messages({ level: "debug" })`
  - `mcp__playwright__browser_network_requests({ static: false })`
- **Форма засабмічена:** ні (лише заповнена; усі 8 значень підтверджено снапшотом, бюджет
  `$500–1500 / міс.` [selected], чекбокс e39 не відмічений).
- **Консоль:** без змін — ті самі 2 повідомлення (`[INFO]` React DevTools, `[LOG] [HMR] connected`),
  0 errors, 0 warnings.
- **Network:** нових запитів немає — заповнення полів нічого не відправляє (0 нестатичних,
  21 статичний з кроку 1).

### Крок 3 — відправити форму (сабміт: 2026-10-11 09:38:59 UTC / 12:38:59 EEST)

- **Запис (що роблю):** натискаю «Надіслати заявку» і одразу перевіряю, що показала сторінка,
  консоль і мережа.
- **Коли засабмічена:** `date` безпосередньо перед кліком — `2026-10-11T09:38:57Z`; заголовок `date`
  у відповіді сервера — `Sun, 11 Oct 2026 09:38:59 GMT`; снапшот після кліку —
  `page-2026-10-11T09-39-00-500Z.yml`. Тобто форма засабмічена о **09:38:59 UTC (12:38:59 EEST)**.
- **Tool-calls:**
  - `Bash: date -u` — фіксую час перед сабмітом.
  - `mcp__playwright__browser_click({ target: "e40", element: "Кнопка «Надіслати заявку»" })` →
    `await page.getByRole('button', { name: 'Надіслати заявку' }).click();`
  - `mcp__playwright__browser_snapshot({})`
  - `mcp__playwright__browser_console_messages({ level: "debug" })`
  - `mcp__playwright__browser_network_requests({ static: false })`
- **Що на сторінці після сабміту:** форма замінилась повідомленням (e51):
  «Дякуємо! Заявку отримано.» / «Ми зв'яжемося з вами протягом робочого дня.» URL лишився
  `http://localhost:3000/`, перезавантаження сторінки не було. `alert` (e41) порожній — помилок
  валідації немає.
- **Консоль:** нових повідомлень немає — ті самі 2 (`[INFO]` React DevTools, `[LOG] [HMR] connected`),
  **0 errors, 0 warnings**.
- **Network:** з'явився один новий запит:
  - `#22 [POST] http://localhost:3000/ => [200] OK` (21 статичний запит з кроку 1 без змін).

### Крок 4 — деталі запиту сабміту в Network (≈12:39 EEST)

- **Запис (що роблю):** відкриваю повні деталі запиту #22 — заголовки, тіло запиту й відповіді, —
  і перевіряю, чи не пішло щось на інші адреси.
- **Tool-calls:**
  - `mcp__playwright__browser_network_request({ index: 22 })`
  - `mcp__playwright__browser_network_request({ index: 22, part: "request-body" })`
  - `mcp__playwright__browser_network_request({ index: 22, part: "response-body" })`
  - `mcp__playwright__browser_console_messages({ level: "debug", all: true })` — уся консоль за сесію.
  - `mcp__playwright__browser_network_requests({ static: true, filter: "^(?!http://localhost:3000)" })` —
    запити на будь-які інші origin.
- **Форма засабмічена:** так, один раз (крок 3); тут лише читаю результат.
- **Network — #22 `POST http://localhost:3000/`:**
  - General: `200 OK`, `duration 192ms`, `type fetch`, `mimeType text/x-component`.
  - Це виклик **Server Action** Next.js: заголовок `next-action: 6078409f4dfff858566a06f87732d8eb50dacdd91e`,
    `accept: text/x-component`, `content-type: multipart/form-data`, `origin`/`referer`
    `http://localhost:3000`.
  - Тіло запиту (multipart) — службові поля Server Action (`$ACTION_REF_1`, `$ACTION_1:0` з `id` дії,
    попередній стан `[{"status":"idle"}]`, `$ACTION_KEY`) і поля форми:

    | поле        | значення                                                              |
    |-------------|-----------------------------------------------------------------------|
    | `firstName` | `Тест`                                                                |
    | `lastName`  | `Playwright`                                                          |
    | `email`     | `test.playwright@example.com`                                         |
    | `phone`     | `+380000000000`                                                       |
    | `company`   | `Test Company (MCP check)`                                            |
    | `website`   | `https://example.com`                                                 |
    | `budget`    | `1500` (value опції «$500–1500 / міс.»)                               |
    | `message`   | `Тестова заявка від Playwright MCP для перевірки форми. Не обробляти.` |

    Поля чекбокса розсилки в тілі немає — він не відмічений, тож браузер його не надсилає.
  - Заголовки відповіді: `cache-control: no-cache, must-revalidate`, `content-type: text/x-component`,
    `content-encoding: gzip`, `date: Sun, 11 Oct 2026 09:38:59 GMT`.
  - Тіло відповіді (RSC-потік):
    ```
    0:{"a":"$@1","f":"","q":"","i":true,"b":"development"}
    1:D"$2"
    1:{"status":"ok"}
    ```
    Дія повертає лише `{"status":"ok"}` — без ID ліда й без персональних даних у відповіді.
    `1:D"$2"` — службовий рядок dev-режиму (debug info).
- **Консоль (уся сесія, `all: true`):** 2 повідомлення, 0 errors, 0 warnings — ті самі, що в кроці 1.
- **Інші адреси:** фільтр `^(?!http://localhost:3000)` повернув порожній список — **жодного запиту
  поза `http://localhost:3000`** за всю сесію (і статичних, і нестатичних).

### Крок 5 — закрити браузер (≈12:40 EEST)

- **Запис (що роблю):** закриваю сторінку, щоб ізольований профіль браузера не лишався відкритим.
- **Tool-calls:**
  - `mcp__playwright__browser_close({})` → `await page.close()`, результат «No open tabs».
  - `Bash: git status --short; git check-ignore -v .playwright-mcp/` — службові файли Playwright MCP
    (`.playwright-mcp/console-*.log`, `page-*.yml`) лежать у теці, яку ігнорує `.gitignore:49`.
- **Форма засабмічена:** ні (сабміт був один — у кроці 3).
- **Консоль / Network:** сторінку закрито, нових подій немає.

### Крок 6 — що робить сервер після сабміту (читання коду, ≈12:41 EEST)

- **Запис (що роблю):** браузерний Network показує лише запити браузера, тож читаю Server Action,
  щоб знати, що відбувається на сервері після `{"status":"ok"}`.
- **Tool-calls:** `Bash: grep -rln "use server" app lib`, `Read app/actions.ts`,
  `Read lib/n8n/client.ts`, `Bash: grep … lib/db.ts`. `.env.local` не відкривав.
- **Форма засабмічена:** ні (новий сабміт не робив).
- **Висновок:**
  - `submitLead` (`app/actions.ts:21`) валідує форму (`parseLeadForm`), записує лід через
    `db.insertLead` — це in-memory сховище на `globalThis` (`lib/db.ts:281`, `:370`); заявка
    зникне після перезапуску dev-сервера.
  - Потім, уже після відповіді, в `after()` (`app/actions.ts:64`) викликаються
    `triggerWorkflow("lead-created", …)` і `logAudit("lead.created", …)`. `triggerWorkflow`
    (`lib/n8n/client.ts:27`) робить серверний `POST` на `${N8N_WEBHOOK_BASE_URL}/lead-created`,
    якщо задані `N8N_WEBHOOK_BASE_URL` і `N8N_WEBHOOK_TOKEN`, інакше пише в лог сервера
    `n8n -> lead-created skipped: …`.
  - Цей серверний запит **не видно** у вкладці Network браузера і в консолі браузера — лише в
    терміналі `npm run dev`. Чи він пішов і куди — з браузера встановити не можна; значень змінних
    середовища я не читав. Перевірити можна в терміналі dev-сервера за рядком `n8n -> lead-created …`.

## Підсумок

| що перевірено                   | результат                                                           |
|---------------------------------|---------------------------------------------------------------------|
| Відкриті адреси                 | лише `http://localhost:3000/`                                       |
| Форма заповнена                 | 8 полів, тестові дані на `example.com`, чекбокс розсилки не відмічено |
| Сабміт                          | 2026-10-11 09:38:59 UTC (12:38:59 EEST), один раз                   |
| Відповідь UI                    | «Дякуємо! Заявку отримано.»                                         |
| Network                         | 1 нестатичний запит: `POST /` (Server Action) → `200 OK`, 192 ms, відповідь `{"status":"ok"}` |
| Консоль                         | 2 повідомлення (`[INFO]` React DevTools, `[LOG] [HMR] connected`), 0 errors, 0 warnings |
| Запити на інші origin           | 0                                                                   |
| Помилки валідації               | немає                                                               |
| Серверний виклик n8n (`after()`) | у браузері не видно; див. крок 6 — перевіряти в терміналі dev-сервера |

Тестова заявка потрапила в in-memory базу dev-сервера (`lib/db.ts`) і зникне після його перезапуску.
