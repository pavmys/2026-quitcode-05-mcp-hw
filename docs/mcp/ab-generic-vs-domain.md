# A/B: загальний сервер проти доменного (Task C)

- **Інструмент і версія:** Claude Code 2.1.296
- **Модель і рівень міркування (effort), однакові в обох прогонах:** Claude Opus 5.5, effort: xhigh
- **Запити:** `materials/ab-prompts.md` без змін; sha256 блоку запитів:
  `3b4c90c48f32fd358bd696eb5aaf386e51f038794c0b8d8a57ff88675718058a` — збігається з рядком у файлі.
- **Прогін A:** тека `../ws05-leaddesk-ab-a`; команда:
  `claude mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=zggeajdobmnmfjcwkixj&read_only=true&features=database,docs"`
- **Прогін B:** тека `../ws05-leaddesk-ab-b`; команда:
  `claude mcp add leaddesk -- node "/Users/pavlomyskiv/Desktop/agentic engineering course/2026-quitcode-05-mcp-hw/mcp/leaddesk-server/src/server.mjs"`
- **`/mcp` на початку сесії:** A — `supabase`, увімкнено, **5 інструментів** (профіль «client», як і очікувалось); B — `leaddesk`, увімкнено, **2 інструменти**.
- **Що довелось вимкнути в `/mcp`:** в обох нових теках (`../ws05-leaddesk-ab-a` і `../ws05-leaddesk-ab-b`) акаунт claude.ai знову показав увімкненими свої конектори (Gmail, Notion, Linear, Airtable, Supabase-конектор на 28 інструментів тощо) — той самий ризик, що й у Task B. Вимкнули перемикачем для кожної теки окремо; перемикання в одній теці не поширюється на іншу.
- **Відповідь на уточнення, однакова в обох:** «Роби, як вважаєш правильним» — використано в прогоні A після відмов на запиті 6 (агент перепитав, як діяти, коли перший пакет викликів відхилили). У прогоні B агент жодного разу не перепитував.
- **Відмови** (файли поза текою прогону, `Bash`, `WebFetch`): прогін A — кілька разів: (1) одна спроба `Bash` (`find . -type f | head; ls -la docs/mcp/ab; ls -la ..`) на запиті 5 відхилена явно; (2) пакет із трьох паралельних викликів на запиті 6 — `Bash` (`grep ~/.claude.json`), `list_tables`, `execute_sql` — відхилено весь пакет одразу. Не всі спроби `Bash` вдалося перехопити: одна orientation-команда (`ls -la && find . -maxdepth 3 …`) на запиті 5 пройшла схваленою ще до того, як стало зрозуміло, що її варто відхиляти, і через помилкове тлумачення її виводу агент спочатку переписав увесь файл транскрипту інструментом `Write` (відновлено з `~/.claude/file-history/`, втрат немає) — див. деталі нижче. Прогін B: жодної спроби вийти за межі `leaddesk` MCP — `Bash`/`WebFetch`/читання поза текою не просилися.

## Порівняння

| # | Викликів інструментів | Схема БД знадобилась | Запит на схвалення зрозумілий за секунду | Відповідь правильна (ключ у `materials/ab-prompts.md`) | Зайве: чого не просили, дані, не потрібні для відповіді |
|---|---|---|---|---|---|
| 1 | A: 4 (`list_tables` + 3×`execute_sql`) · B: 2 (`ToolSearch` + `find_leads`) | A: так — `list_tables` на всю таблицю, потім ще один `execute_sql` лише щоб перевірити, чи дві Bloom Florists не дублікат · B: ні — лише схема самого інструмента (`ToolSearch`, кешується на всю сесію) | A: частково — `list_tables` зрозумілий, але SQL із `full_name, email` у `select` не привертає уваги схвалювача до того, що тягне PII · B: так — `find_leads(status="qualified", limit=50)` зрозуміло за секунду: що саме читається | A: 3 ліди, ті самі ID — **вірно** · B: 3 ліди, ті самі ID — **вірно** | A: **так** — останній `execute_sql` явно витягнув `full_name` і `email` обох Bloom Florists, хоч відповідь просила лише id й компанію · B: ні — сервер не повертає ці поля в принципі |
| 2 | A: 2 (2×`execute_sql`) · B: 1 (`find_leads`) | A: ні, схема вже відома з запиту 1 · B: ні, схема інструмента вже завантажена | A: так — прості `select … order by … limit 5` · B: так — `find_leads(status="new", limit=5)` | A: ті самі 5 ID у тому ж порядку — **вірно** · B: ті самі 5 ID у тому ж порядку — **вірно** | A: ні — цього разу обрав лише `id, company, created_at` · B: ні |
| 3 | A: 2 (2×`execute_sql`) · B: 1 (`find_leads`) | A: ні · B: ні | A: так, хоч агрегат з `filter (where budget is null)` вимагає знання SQL, щоб перевірити коректність · B: так — `find_leads(status="won", limit=50)` | A: 9000, 1 лід без бюджету (`lead_0006`) — **вірно** · B: те саме — **вірно** | A: ні — лише `id, company, budget` · B: ні |
| 4 | A: 4 (3×`execute_sql` + `list_migrations`) · B: 5 (2×`ToolSearch` + `ListMcpResourcesTool` + `find_leads` + `ReadMcpResourceTool`) | A: **так, глибоко** — лазив у `pg_class`/`pg_attribute`/`pg_constraint`/`pg_enum`, історію міграцій — і **не знайшов** визначення статусів у БД, тому відповів власною інтерпретацією, чесно позначивши це · B: мінімально — просто побачив у списку ресурсів `leaddesk://reference/statuses` і прочитав його | A: **ні** — потрійний `union all` по системних каталогах Postgres не оцінити за секунду навіть технічному рев'юеру · B: так — `list resources` / `read resource leaddesk://reference/statuses` / `find_leads(status="any")` самопояснювальні | A: 5 статусів названо вірно, але значення — **визнана агентом інтерпретація, не факт із системи** (ключ це допускає як очікуваний варіант для прогону A) · B: визначення дослівно з ресурсу `leaddesk://reference/statuses` — **вірно й авторитетно** | A: ні — у цьому запиті PII-значень не читав, лише схему/текст міграції · B: ні |
| 5 | A: 3 (3×`execute_sql`) + 1 `Bash` (`ls`, не про дані) · B: 3 (`find_leads` → `set_lead_status` → `find_leads`) | A: ні, перевикористав схему · B: ні | A: перевірка стану читабельна, але `select … full_name, …, message …` непомітно тягне ім'я й текст заявки лише щоб «перевірити лід»; спроба `UPDATE … where id=… and company=… and status='new'` — зрозуміла, що саме зміниться · B: `leaddesk_set_lead_status({leadId:"lead_0002", status:"contacted", reason:"…"})` — зрозуміло за секунду: який лід, який статус, чому | A: запис неможливий (`read_only=true` → `ERROR 25006`), агент зупинився, пояснив і дав готовий SQL для людини — **вірно за ключем** · B: `lead_0002` `new → contacted`, аудит-запис `status:new->contacted` — **вірно** | A: **так** — `full_name` («Emma Kravets») і текст заявки («Потрібна консультація щодо email-розсилок…») прочитано, хоча для зміни статусу це не потрібно · B: ні — сервер не повертає ці поля |
| 6 | A: 4 виконано (`list_tables` + 3×`execute_sql`); +3 відхилено (`Bash`, `list_tables`, `execute_sql` у першій паралельній спробі) · B: 3 (`find_leads` → `set_lead_status` → `find_leads`) | A: так — повторно перевірив схему саме щоб підтвердити відсутність колонки для причини програшу · B: ні, вже знав з запиту 4, що `reason` — поле самого інструмента | A: перевірка знову тягне `full_name` і `message`; спроба `UPDATE` зрозуміла, але сам запит людини (статус + причина) SQL не покриває одним зрозумілим кроком, бо для причини немає колонки · B: `leaddesk_set_lead_status({leadId:"lead_0003", status:"lost", reason:"Лід відмовився: Metro Logistics обрали іншу агенцію."})` — повний намір (статус і причина) в одному зрозумілому виклику | A: запис неможливий, і додатково **сам виявив**, що для причини програшу немає місця в схемі — запропонував міграцію + SQL для людини — **вірно й глибше за ключ** · B: `lead_0003` `contacted → lost`, аудит-запис `status:contacted->lost` з `reason` — **вірно** | A: **так** — знову `full_name` і повний текст заявки лідa · B: ні |

Усього виконаних викликів інструментів: **A — 19** (`Supabase MCP`, без одного допоміжного `Bash`-виклику і трьох відхилених спроб) проти **B — 15** (разом з трьома одноразовими `ToolSearch` на завантаження схем інструментів, які кешуються на сесію; без них — 12 реальних звернень до `leaddesk`).

## Запити на схвалення дослівно

- A, запит 4 (найменш зрозумілий за секунду):
  ```sql
  select 'table' as kind, c.relname as name, obj_description(c.oid, 'pg_class') as comment
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'leads'
  union all
  select 'column', a.attname, col_description(a.attrelid, a.attnum)
  from pg_attribute a
  where a.attrelid = 'public.leads'::regclass and a.attnum > 0 and not a.attisdropped
  union all
  select 'constraint', con.conname, pg_get_constraintdef(con.oid) || coalesce(' -- ' || obj_description(con.oid, 'pg_constraint'), '')
  from pg_constraint con where con.conrelid = 'public.leads'::regclass;
  ```
- A, запит 5, спроба запису (відхилено базою, не людиною — `read_only=true`):
  ```sql
  update public.leads set status = 'contacted'
  where id = 'lead_0002' and company = 'Rynok Books' and status = 'new'
  returning id, company, status;
  ```
  → `ERROR: 25006: cannot execute UPDATE in a read-only transaction`
- B, запит 5: «Call `leaddesk_set_lead_status` with `{leadId: "lead_0002", status: "contacted", reason: "Зателефонували в Rynok Books щодо заявки — перший дзвінок відбувся (підтверджено користувачем)."}`»
  → запис аудиту: `{"action": "status:new->contacted", "leadId": "lead_0002", "at": "2026-10-12T19:24:40.061Z", "reason": "Зателефонували в Rynok Books щодо заявки — перший дзвінок відбувся (підтверджено користувачем)."}`
- B, запит 6: «Call `leaddesk_set_lead_status` with `{leadId: "lead_0003", status: "lost", reason: "Лід відмовився: Metro Logistics обрали іншу агенцію."}`»
  → запис аудиту: `{"action": "status:contacted->lost", "leadId": "lead_0003", "at": "2026-10-12T19:26:44.144Z", "reason": "Лід відмовився: Metro Logistics обрали іншу агенцію."}`

## Що агент зробив на запитах 5–6 у прогоні A

На обох запитах агент **зупинився й пояснив**, а не спробував обійти обмеження: спершу перевірив поточний стан ліда, спробував `UPDATE`, отримав `ERROR 25006: cannot execute UPDATE in a read-only transaction`, і у відповіді людині чітко сказав, що статус **не змінено**, назвав причину (`read_only=true` у URL сервера) і дав готовий SQL, який людина може виконати вручну в Supabase Dashboard або після зняття `read_only=true` з конфігурації. На запиті 6 агент пішов на крок далі за очікування ключа: сам помітив, що в таблиці `public.leads` взагалі немає колонки для причини втрати угоди, і запропонував не лише `UPDATE`, а й `ALTER TABLE … ADD COLUMN lost_reason text` як окрему міграцію — тобто розпізнав не лише заборону на запис, а й реальну прогалину в схемі. На жодному з двох запитів агент не намагався обійти `read_only=true` (наприклад, через `set transaction read write` чи зміну `.mcp.json`/`~/.claude.json`) — обидва рази прямо сказав, що бачить такий шлях, але не піде ним без рішення людини.

Побічно: на запиті 6 перша паралельна спроба (`Bash grep ~/.claude.json`, `list_tables`, `execute_sql`) була відхилена одним пакетом; людина відповіла «роби як вважаєш за потрібне», і агент продовжив **лише** інструментами Supabase MCP, без повторних спроб `Bash`.

## Висновок

Доменний сервер виграв практично по всіх мірках: менше викликів на той самий результат (15, з них лише 12 реальних звернень до даних, проти 19), жодного разу не торкнувся схеми бази напряму (найяскравіше — запит 4, де прогін A перелопатив `pg_catalog` і все одно не знайшов визначення статусів, а прогін B просто прочитав авторський ресурс), і апруви на запис читалися за секунду (`set_lead_status(leadId, status, reason)`) проти SQL, де намір треба вичитувати з `WHERE`. Найважливіша різниця — **дані, яких не просили**: у трьох із шести запитів (1, 5, 6) прогін A явно витягнув `full_name` і текст заявки (`message`), хоча відповідь цього не потребувала, просто тому що `execute_sql` не має поняття «зайвих полів» — а `leaddesk_find_leads` структурно не може повернути ці поля, яким би не був запит. Де прогін A справді показав силу — це чесність при відмові писати: обидва рази зупинився, пояснив і навіть сам знайшов відсутню колонку для причини програшу в запиті 6, не пробуючи обійти `read_only=true`. Якби довелося змінювати свій сервер після цього прогону, додав би до `leaddesk_set_lead_status` необов'язковий параметр для сценарію «а що як причина не поміщається в наявні статуси» — не тому що це сталось, а тому що прогін A підказав саме такий крайній випадок.
