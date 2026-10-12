# B (domain): ліди у статусі `qualified`

Дата: 2026-10-12

## Результат

Зараз у статусі **qualified** — **3 ліди**:

| ID | Компанія | Джерело | Бюджет | Створено (UTC) |
|---|---|---|---|---|
| `lead_0001` | North Wind Yachts | facebook-ads | 2500 | 2026-09-20 06:32 |
| `lead_0013` | Bloom Florists | facebook-ads | 1500 | 2026-09-07 13:54 |
| `lead_0015` | Bloom Florists | website | 2500 | 2026-08-18 15:29 |

Bloom Florists має два окремі qualified-ліди (`lead_0013` і `lead_0015`), тож різних компаній дві, а лідів три.

Список повний: запит робили з `limit: 50`, а сервер повернув 3 записи, тобто менше за ліміт.

## Transcript

### 1. Запит користувача

> Скільки лідів зараз у статусі qualified? Назви їхні ідентифікатори й компанії. Результат і transcript запиши у файл docs/mcp/ab/b-domain.md .

### 2. Завантаження схеми інструмента

`ToolSearch` → `select:mcp__leaddesk__leaddesk_find_leads`

Опис інструмента з відповіді:

> Returns LeadDesk leads filtered by status, newest first. Read-only. The response never includes the lead's name, email, or message text — only company, status, source, budget, and createdAt.

Параметри: `status` (обов'язковий; `new | contacted | qualified | won | lost | any`) і `limit` (1–50, за замовчуванням 10).

### 3. Виклик MCP-інструмента

```json
{
  "tool": "mcp__leaddesk__leaddesk_find_leads",
  "input": {
    "status": "qualified",
    "limit": 50
  }
}
```

### 4. Відповідь сервера (сирий вигляд)

```json
{
  "leads": [
    {
      "id": "lead_0001",
      "company": "North Wind Yachts",
      "status": "qualified",
      "source": "facebook-ads",
      "budget": 2500,
      "createdAt": "2026-09-20T06:32:40.447Z"
    },
    {
      "id": "lead_0013",
      "company": "Bloom Florists",
      "status": "qualified",
      "source": "facebook-ads",
      "budget": 1500,
      "createdAt": "2026-09-07T13:54:42.854Z"
    },
    {
      "id": "lead_0015",
      "company": "Bloom Florists",
      "status": "qualified",
      "source": "website",
      "budget": 2500,
      "createdAt": "2026-08-18T15:29:38.903Z"
    }
  ]
}
```

### 5. Відповідь асистента

У статусі qualified зараз 3 ліди:

- `lead_0001`: North Wind Yachts
- `lead_0013`: Bloom Florists
- `lead_0015`: Bloom Florists

Примітки:
- Ми робили лише читання; `leaddesk_set_lead_status` не викликали.
- Сервер не повертає ім'я, email і текст повідомлення ліда, тому їх у результаті немає.

---

# B (domain): п'ять найновіших лідів у статусі `new`

Дата: 2026-10-12

## Результат

Нижче п'ять найновіших лідів у статусі **new**, від новішого до старішого:

| # | ID | Компанія | Дата заявки (UTC) |
|---|---|---|---|
| 1 | `lead_0002` | Rynok Books | 2026-09-13 00:52 |
| 2 | `lead_0005` | Brick & Beam | 2026-09-12 02:42 |
| 3 | `lead_0004` | Green Leaf Market | 2026-08-30 17:46 |
| 4 | `lead_0018` | Green Leaf Market | 2026-07-18 05:08 |
| 5 | `lead_0012` | Lviv Coffee Lab | 2026-07-07 20:23 |

Сервер сортує ліди від найновіших (так сказано в описі інструмента), і дати `createdAt` у відповіді справді йдуть за спаданням.

Цей запит мав `limit: 5`, тому відповідь показує лише перші п'ять. Скільки всього лідів у статусі new, з неї не видно.

## Transcript

### 1. Запит користувача

> Покажи п'ять найновіших лідів зі статусом new: ідентифікатор, компанія, дата заявки. Результати і transcript допиши у файл docs/mcp/ab/b-domain.md .

### 2. Виклик MCP-інструмента

Схему інструмента вже завантажили для першого запиту, тож `ToolSearch` тут не знадобився.

```json
{
  "tool": "mcp__leaddesk__leaddesk_find_leads",
  "input": {
    "status": "new",
    "limit": 5
  }
}
```

### 3. Відповідь сервера (сирий вигляд)

```json
{
  "leads": [
    {
      "id": "lead_0002",
      "company": "Rynok Books",
      "status": "new",
      "source": "webinar",
      "budget": 500,
      "createdAt": "2026-09-13T00:52:02.043Z"
    },
    {
      "id": "lead_0005",
      "company": "Brick & Beam",
      "status": "new",
      "source": "linkedin",
      "budget": 500,
      "createdAt": "2026-09-12T02:42:39.732Z"
    },
    {
      "id": "lead_0004",
      "company": "Green Leaf Market",
      "status": "new",
      "source": "facebook-ads",
      "budget": 1500,
      "createdAt": "2026-08-30T17:46:42.505Z"
    },
    {
      "id": "lead_0018",
      "company": "Green Leaf Market",
      "status": "new",
      "source": "google-ads",
      "budget": null,
      "createdAt": "2026-07-18T05:08:24.837Z"
    },
    {
      "id": "lead_0012",
      "company": "Lviv Coffee Lab",
      "status": "new",
      "source": "website",
      "budget": null,
      "createdAt": "2026-07-07T20:23:53.712Z"
    }
  ]
}
```

### 4. Відповідь асистента

П'ять найновіших лідів зі статусом new:

1. `lead_0002`: Rynok Books, 2026-09-13
2. `lead_0005`: Brick & Beam, 2026-09-12
3. `lead_0004`: Green Leaf Market, 2026-08-30
4. `lead_0018`: Green Leaf Market, 2026-07-18
5. `lead_0012`: Lviv Coffee Lab, 2026-07-07

Примітки:
- Ми знову лише читали дані, статуси не змінювали.
- Green Leaf Market має серед них два окремі ліди.
- Скільки всього лідів у статусі new, невідомо, бо запит був обмежений п'ятьма записами.

---

# B (domain): сумарний бюджет лідів у статусі `won`

Дата: 2026-10-12

## Результат

Сумарний бюджет лідів у статусі **won** становить **9000**.

- Усього won-лідів: **5**
- У суму ввійшли 4 ліди з бюджетом.
- **1 лід без бюджету** (`budget: null`) у суму не ввійшов: `lead_0006`, Nova Dental.

| ID | Компанія | Бюджет | У сумі |
|---|---|---|---|
| `lead_0011` | Lviv Coffee Lab | 5000 | так |
| `lead_0006` | Nova Dental | — (null) | ні |
| `lead_0016` | Karpaty Tours | 1000 | так |
| `lead_0010` | Artisan Bakery | 2500 | так |
| `lead_0017` | Hutsul Crafts | 500 | так |
| | **Разом** | **9000** | |

Розрахунок: 5000 + 1000 + 2500 + 500 = **9000**.

Список повний: запит мав `limit: 50`, а сервер повернув 5 записів, тобто менше за ліміт.

Валюту бюджету сервер не повертає, тому сума вказана без одиниць.

## Transcript

### 1. Запит користувача

> Який сумарний бюджет лідів у статусі won? Ліди без бюджету в суму не додавай, але скажи, скільки їх. Результати і transcript допиши у файл docs/mcp/ab/b-domain.md .

### 2. Виклик MCP-інструмента

```json
{
  "tool": "mcp__leaddesk__leaddesk_find_leads",
  "input": {
    "status": "won",
    "limit": 50
  }
}
```

Ліміт поставили на максимум (50), щоб сума охопила всі won-ліди, а не лише перші 10, які сервер повертає за замовчуванням.

### 3. Відповідь сервера (сирий вигляд)

```json
{
  "leads": [
    {
      "id": "lead_0011",
      "company": "Lviv Coffee Lab",
      "status": "won",
      "source": "facebook-ads",
      "budget": 5000,
      "createdAt": "2026-09-11T12:34:50.420Z"
    },
    {
      "id": "lead_0006",
      "company": "Nova Dental",
      "status": "won",
      "source": "linkedin",
      "budget": null,
      "createdAt": "2026-08-31T21:08:50.351Z"
    },
    {
      "id": "lead_0016",
      "company": "Karpaty Tours",
      "status": "won",
      "source": "google-ads",
      "budget": 1000,
      "createdAt": "2026-07-30T05:49:44.585Z"
    },
    {
      "id": "lead_0010",
      "company": "Artisan Bakery",
      "status": "won",
      "source": "linkedin",
      "budget": 2500,
      "createdAt": "2026-07-20T15:04:37.639Z"
    },
    {
      "id": "lead_0017",
      "company": "Hutsul Crafts",
      "status": "won",
      "source": "webinar",
      "budget": 500,
      "createdAt": "2026-06-27T08:23:09.596Z"
    }
  ]
}
```

### 4. Відповідь асистента

Сумарний бюджет won-лідів становить **9000** (5000 + 1000 + 2500 + 500).

Без бюджету **1 лід**: `lead_0006` (Nova Dental), його в суму не додавали.

Примітки:
- Ми лише читали дані, статуси не змінювали.
- Валюту сервер не повертає.

---

# B (domain): статуси лідів у LeadDesk та їхнє значення для команди

Дата: 2026-10-12

## Результат

У LeadDesk **п'ять статусів** лідів. Пояснення нижче взяті з довідкового ресурсу самого сервера (`leaddesk://reference/statuses`), а не придумані асистентом.

| Статус | Що означає | Коли ставити / хто ставить | Лідів зараз |
|---|---|---|---|
| `new` | Заявка щойно надійшла, з лідом ще ніхто не зв'язувався. | Початковий статус кожної нової заявки. | 6 |
| `contacted` | Менеджер зв'язався з лідом (дзвінок, email або повідомлення) і підтвердив, що контакт живий. | Ставити одразу після першого дзвінка, **хоч би яким був його результат**. | 4 |
| `qualified` | Дзвінок підтвердив реальний бюджет і справжню потребу в послузі, тож лід готовий отримати комерційну пропозицію. | **Ніколи не ставити без підтвердженого бюджету**, навіть якщо лід виглядає зацікавленим. | 3 |
| `won` | Клієнт підписав угоду або оплатив рахунок. | Ставить **лише власник угоди** (менеджер, який вів переговори), коли переконається в оплаті або підписаному договорі. | 5 |
| `lost` | Лід відмовився, не відповідає понад два тижні або не підійшов за бюджетом чи нішею. | **Завжди записувати причину** в поле `reason` аудит-запису, щоб команда бачила, чому угода зірвалася. | 2 |
| | | **Разом** | **20** |

Звичайний шлях ліда: `new` → `contacted` → `qualified` → `won`. На будь-якому етапі лід може піти в `lost`.

`any` лише значення фільтра в `leaddesk_find_leads`, яке означає «всі статуси». Статусом воно не є: `leaddesk_set_lead_status` приймає тільки п'ять значень з таблиці.

Що це означає для роботи з інструментами:
- Кожна зміна статусу через `leaddesk_set_lead_status` створює аудит-запис і вимагає поля `reason` (3–500 символів). Перед викликом людина має підтвердити саме цю зміну для саме цього ліда.
- Для `lost` поле `reason` особливо важливе, бо в ньому записують причину втрати угоди.

Розподіл за статусами повний: запит `status: "any"` мав `limit: 50`, а сервер повернув 20 записів. Звідси видно також, що лідів у статусі `new` всього 6. Попередній запит (`limit: 5`) показав лише перші п'ять; шостий — `lead_0019`, Svitlo Solar, 2026-06-30.

Невідповідність, яку варто перевірити: `lead_0006` (Nova Dental) має статус `won`, але бюджет у нього `null`. Довідник забороняє ставити `qualified` без підтвердженого бюджету, а `won` зазвичай іде після `qualified`. Тож або бюджет не внесли в систему, або лід пропустив цей етап. Окремої вимоги щодо бюджету для `won` у довіднику немає, тому це лише сигнал для перевірки, а не точно помилка.

## Transcript

### 1. Запит користувача

> Які статуси лідів є в LeadDesk і що кожен із них означає для команди? Результати і transcript допиши в файл docs/mcp/ab/b-domain.md .

### 2. Завантаження схем інструментів

`ToolSearch` → `select:mcp__leaddesk__leaddesk_set_lead_status,ListMcpResourcesTool`

Схему `leaddesk_set_lead_status` завантажили лише для того, щоб прочитати її опис. Сам інструмент **не викликали**. Опис:

> Changes a LeadDesk lead's status and adds an audit entry. This changes process data: before calling, make sure a human has confirmed this exact status change for this exact lead.

Параметри: `leadId` (формат `lead_\d{4}`), `status` (`new | contacted | qualified | won | lost`), `reason` (3–500 символів). Усі три обов'язкові.

### 3. Пошук довідкових ресурсів сервера

```json
{
  "tool": "ListMcpResourcesTool",
  "input": { "server": "leaddesk" }
}
```

Відповідь:

```json
[
  {
    "name": "leaddesk-statuses",
    "title": "LeadDesk lead statuses",
    "uri": "leaddesk://reference/statuses",
    "description": "The five lead statuses and what each means for the team: when to assign it and who does",
    "mimeType": "text/markdown",
    "server": "leaddesk"
  }
]
```

### 4. Виклик MCP-інструмента (паралельно з кроком 3)

Мета виклику: перевірити, які статуси справді трапляються в даних, і порахувати ліди в кожному.

```json
{
  "tool": "mcp__leaddesk__leaddesk_find_leads",
  "input": {
    "status": "any",
    "limit": 50
  }
}
```

Відповідь сервера (сирий вигляд):

```json
{
  "leads": [
    { "id": "lead_0001", "company": "North Wind Yachts", "status": "qualified", "source": "facebook-ads", "budget": 2500, "createdAt": "2026-09-20T06:32:40.447Z" },
    { "id": "lead_0002", "company": "Rynok Books", "status": "new", "source": "webinar", "budget": 500, "createdAt": "2026-09-13T00:52:02.043Z" },
    { "id": "lead_0005", "company": "Brick & Beam", "status": "new", "source": "linkedin", "budget": 500, "createdAt": "2026-09-12T02:42:39.732Z" },
    { "id": "lead_0011", "company": "Lviv Coffee Lab", "status": "won", "source": "facebook-ads", "budget": 5000, "createdAt": "2026-09-11T12:34:50.420Z" },
    { "id": "lead_0008", "company": "Brick & Beam", "status": "contacted", "source": "website", "budget": 1500, "createdAt": "2026-09-10T21:30:58.988Z" },
    { "id": "lead_0013", "company": "Bloom Florists", "status": "qualified", "source": "facebook-ads", "budget": 1500, "createdAt": "2026-09-07T13:54:42.854Z" },
    { "id": "lead_0006", "company": "Nova Dental", "status": "won", "source": "linkedin", "budget": null, "createdAt": "2026-08-31T21:08:50.351Z" },
    { "id": "lead_0004", "company": "Green Leaf Market", "status": "new", "source": "facebook-ads", "budget": 1500, "createdAt": "2026-08-30T17:46:42.505Z" },
    { "id": "lead_0015", "company": "Bloom Florists", "status": "qualified", "source": "website", "budget": 2500, "createdAt": "2026-08-18T15:29:38.903Z" },
    { "id": "lead_0016", "company": "Karpaty Tours", "status": "won", "source": "google-ads", "budget": 1000, "createdAt": "2026-07-30T05:49:44.585Z" },
    { "id": "lead_0014", "company": "Nova Dental", "status": "contacted", "source": "facebook-ads", "budget": 2500, "createdAt": "2026-07-27T20:15:23.380Z" },
    { "id": "lead_0007", "company": "Rynok Books", "status": "lost", "source": "referral", "budget": 5000, "createdAt": "2026-07-26T23:16:04.124Z" },
    { "id": "lead_0020", "company": "UrbanFit Studio", "status": "lost", "source": "referral", "budget": 2500, "createdAt": "2026-07-24T12:31:19.113Z" },
    { "id": "lead_0010", "company": "Artisan Bakery", "status": "won", "source": "linkedin", "budget": 2500, "createdAt": "2026-07-20T15:04:37.639Z" },
    { "id": "lead_0018", "company": "Green Leaf Market", "status": "new", "source": "google-ads", "budget": null, "createdAt": "2026-07-18T05:08:24.837Z" },
    { "id": "lead_0003", "company": "Metro Logistics", "status": "contacted", "source": "facebook-ads", "budget": 10000, "createdAt": "2026-07-18T00:14:44.381Z" },
    { "id": "lead_0012", "company": "Lviv Coffee Lab", "status": "new", "source": "website", "budget": null, "createdAt": "2026-07-07T20:23:53.712Z" },
    { "id": "lead_0019", "company": "Svitlo Solar", "status": "new", "source": "website", "budget": 500, "createdAt": "2026-06-30T21:07:00.656Z" },
    { "id": "lead_0009", "company": "North Wind Yachts", "status": "contacted", "source": "webinar", "budget": 2500, "createdAt": "2026-06-27T14:53:21.060Z" },
    { "id": "lead_0017", "company": "Hutsul Crafts", "status": "won", "source": "webinar", "budget": 500, "createdAt": "2026-06-27T08:23:09.596Z" }
  ]
}
```

Підрахунок за статусами:
- new: `lead_0002`, `lead_0005`, `lead_0004`, `lead_0018`, `lead_0012`, `lead_0019` = 6
- contacted: `lead_0008`, `lead_0014`, `lead_0003`, `lead_0009` = 4
- qualified: `lead_0001`, `lead_0013`, `lead_0015` = 3
- won: `lead_0011`, `lead_0006`, `lead_0016`, `lead_0010`, `lead_0017` = 5
- lost: `lead_0007`, `lead_0020` = 2
- Разом: 20

### 5. Читання довідкового ресурсу

`ToolSearch` → `select:ReadMcpResourceTool`, потім:

```json
{
  "tool": "ReadMcpResourceTool",
  "input": {
    "server": "leaddesk",
    "uri": "leaddesk://reference/statuses"
  }
}
```

Відповідь (оригінальний текст ресурсу, `text/markdown`):

```markdown
# LeadDesk lead statuses

- `new` — the request just came in, nobody has contacted this lead yet. Starting status for every new submission.
- `contacted` — a manager reached the lead (call, email, or message) and confirmed the contact is live.
  Move here right after the first call, regardless of its outcome.
- `qualified` — the call confirmed a real budget and a genuine need for the service: the lead is ready
  for a commercial proposal. Never assign this status without a confirmed budget, even if the lead seems interested.
- `won` — the client signed a deal or paid an invoice. Only the deal owner (the manager who ran the
  negotiation) moves a lead here, after confirming payment or a signed contract.
- `lost` — the lead declined, stopped responding for over two weeks, or didn't fit the budget/niche. Always
  record the reason in the audit entry's `reason` field so the team can see why the deal fell through.
```

### 6. Відповідь асистента

У LeadDesk п'ять статусів:

1. **`new`**: заявка щойно надійшла, з лідом ще не зв'язувалися (6 лідів).
2. **`contacted`**: менеджер зв'язався з лідом і підтвердив, що контакт живий. Ставити одразу після першого дзвінка, хоч би яким був результат (4).
3. **`qualified`**: підтверджені бюджет і потреба, тож лід готовий до комерційної пропозиції. Без підтвердженого бюджету не ставити (3).
4. **`won`**: угоду підписано або рахунок оплачено. Ставить лише власник угоди (5).
5. **`lost`**: лід відмовився, мовчить понад 2 тижні або не підійшов. Причину обов'язково записати в `reason` (2).

Примітки:
- Визначення взяті з ресурсу сервера `leaddesk://reference/statuses`.
- Ми лише читали дані, статуси не змінювали (`leaddesk_set_lead_status` не викликали).
- `lead_0006` (Nova Dental) має статус `won` без бюджету, це варто перевірити.
- Лідів у статусі `new` всього 6. Попередня вибірка з п'ятьох не включала `lead_0019` (Svitlo Solar).

---

# B (domain): перевести `lead_0002` (Rynok Books) у статус `contacted`

Дата: 2026-10-12

## Результат

Лід **`lead_0002` (Rynok Books)** переведено зі статусу **`new`** у статус **`contacted`**.

| Поле | Значення |
|---|---|
| Лід | `lead_0002`, Rynok Books |
| Зміна | `new` → `contacted` |
| Аудит-запис | `status:new->contacted` |
| Час зміни (UTC) | 2026-10-12 19:24:40 |
| `reason` | «Зателефонували в Rynok Books щодо заявки — перший дзвінок відбувся (підтверджено користувачем).» |

Чому зміну зроблено:
- Користувач прямо назвав і лід (`lead_0002`), і цільовий статус (`contacted`). Цього вимагає опис `leaddesk_set_lead_status`: людина має підтвердити саме цю зміну для саме цього ліда.
- Зміна відповідає правилу з довідника `leaddesk://reference/statuses`: у `contacted` лід переводять одразу після першого дзвінка, хоч би яким був його результат.

Перевірка:
- **До зміни:** `lead_0002` справді був у статусі `new`.
- **Після зміни:** повторне читання показує `lead_0002` серед `contacted`.

Інших лідів зміна не торкнулася. В Rynok Books є ще один лід, `lead_0007`, і він залишився в статусі `lost`.

Кількість лідів за статусами після зміни: new **5** (було 6), contacted **5** (було 4). Решта без змін: qualified 3, won 5, lost 2. Разом так само 20.

## Transcript

### 1. Запит користувача

> Ми вже зателефонували в Rynok Books щодо заявки lead_0002. Переведи цей лід у статус contacted. Результати і transcript допиши у файл docs/mcp/ab/b-domain.md .

### 2. Перевірка перед зміною

Мета: переконатися, що `lead_0002` справді належить Rynok Books і зараз має статус `new`.

```json
{
  "tool": "mcp__leaddesk__leaddesk_find_leads",
  "input": {
    "status": "new",
    "limit": 50
  }
}
```

Відповідь сервера (сирий вигляд):

```json
{
  "leads": [
    { "id": "lead_0002", "company": "Rynok Books", "status": "new", "source": "webinar", "budget": 500, "createdAt": "2026-09-13T00:52:02.043Z" },
    { "id": "lead_0005", "company": "Brick & Beam", "status": "new", "source": "linkedin", "budget": 500, "createdAt": "2026-09-12T02:42:39.732Z" },
    { "id": "lead_0004", "company": "Green Leaf Market", "status": "new", "source": "facebook-ads", "budget": 1500, "createdAt": "2026-08-30T17:46:42.505Z" },
    { "id": "lead_0018", "company": "Green Leaf Market", "status": "new", "source": "google-ads", "budget": null, "createdAt": "2026-07-18T05:08:24.837Z" },
    { "id": "lead_0012", "company": "Lviv Coffee Lab", "status": "new", "source": "website", "budget": null, "createdAt": "2026-07-07T20:23:53.712Z" },
    { "id": "lead_0019", "company": "Svitlo Solar", "status": "new", "source": "website", "budget": 500, "createdAt": "2026-06-30T21:07:00.656Z" }
  ]
}
```

Висновок: `lead_0002` належить Rynok Books і має статус `new`, тож зміну можна робити.

### 3. Зміна статусу

```json
{
  "tool": "mcp__leaddesk__leaddesk_set_lead_status",
  "input": {
    "leadId": "lead_0002",
    "status": "contacted",
    "reason": "Зателефонували в Rynok Books щодо заявки — перший дзвінок відбувся (підтверджено користувачем)."
  }
}
```

Відповідь сервера (сирий вигляд):

```json
{
  "lead": {
    "id": "lead_0002",
    "company": "Rynok Books",
    "status": "contacted",
    "source": "webinar",
    "budget": 500,
    "createdAt": "2026-09-13T00:52:02.043Z"
  },
  "audit": {
    "action": "status:new->contacted",
    "leadId": "lead_0002",
    "at": "2026-10-12T19:24:40.061Z",
    "reason": "Зателефонували в Rynok Books щодо заявки — перший дзвінок відбувся (підтверджено користувачем)."
  }
}
```

### 4. Перевірка після зміни

```json
{
  "tool": "mcp__leaddesk__leaddesk_find_leads",
  "input": {
    "status": "contacted",
    "limit": 50
  }
}
```

Відповідь сервера (сирий вигляд):

```json
{
  "leads": [
    { "id": "lead_0002", "company": "Rynok Books", "status": "contacted", "source": "webinar", "budget": 500, "createdAt": "2026-09-13T00:52:02.043Z" },
    { "id": "lead_0008", "company": "Brick & Beam", "status": "contacted", "source": "website", "budget": 1500, "createdAt": "2026-09-10T21:30:58.988Z" },
    { "id": "lead_0014", "company": "Nova Dental", "status": "contacted", "source": "facebook-ads", "budget": 2500, "createdAt": "2026-07-27T20:15:23.380Z" },
    { "id": "lead_0003", "company": "Metro Logistics", "status": "contacted", "source": "facebook-ads", "budget": 10000, "createdAt": "2026-07-18T00:14:44.381Z" },
    { "id": "lead_0009", "company": "North Wind Yachts", "status": "contacted", "source": "webinar", "budget": 2500, "createdAt": "2026-06-27T14:53:21.060Z" }
  ]
}
```

Висновок: `lead_0002` тепер у статусі `contacted`, а лідів у цьому статусі стало 5.

### 5. Відповідь асистента

`lead_0002` (Rynok Books) переведено зі статусу `new` у `contacted`.

- Аудит-запис: `status:new->contacted`, 2026-10-12 19:24:40 UTC.
- `reason`: «Зателефонували в Rynok Books щодо заявки — перший дзвінок відбувся (підтверджено користувачем).»
- Повторне читання підтвердило зміну.
- Інших лідів не змінювали. Зокрема, `lead_0007` (теж Rynok Books) залишився в статусі `lost`.

---

# B (domain): позначити `lead_0003` (Metro Logistics) як `lost`

Дата: 2026-10-12

## Результат

Лід **`lead_0003` (Metro Logistics)** переведено зі статусу **`contacted`** у статус **`lost`**.

| Поле | Значення |
|---|---|
| Лід | `lead_0003`, Metro Logistics |
| Зміна | `contacted` → `lost` |
| Аудит-запис | `status:contacted->lost` |
| Час зміни (UTC) | 2026-10-12 19:26:44 |
| `reason` | «Лід відмовився: Metro Logistics обрали іншу агенцію.» |

Чому зміну зроблено:
- Користувач прямо назвав лід (`lead_0003`), цільовий статус (`lost`) і причину («обрали іншу агенцію»). Цього вимагає опис `leaddesk_set_lead_status`: людина має підтвердити саме цю зміну для саме цього ліда.
- Зміна відповідає довіднику `leaddesk://reference/statuses`: «лід відмовився» — одна з підстав для `lost`. Довідник також вимагає завжди записувати причину в `reason`, і її записано.

Перевірка:
- **До зміни:** `lead_0003` справді був у статусі `contacted`.
- **Після зміни:** повторне читання показує `lead_0003` серед `lost`.

Інших лідів зміна не торкнулася.

У `lead_0003` найбільший бюджет серед усіх 20 лідів у LeadDesk: 10000.

Кількість лідів за статусами після зміни: contacted **4** (було 5), lost **3** (було 2). Решта без змін: new 5, qualified 3, won 5. Разом так само 20.

## Transcript

### 1. Запит користувача

> Лід lead_0003 (Metro Logistics) відмовився: обрали іншу агенцію. Познач його як lost і вкажи причину. Результати і transcript допиши у файл docs/mcp/ab/b-domain.md .

### 2. Перевірка перед зміною

Мета: переконатися, що `lead_0003` справді належить Metro Logistics і зараз має статус `contacted`.

```json
{
  "tool": "mcp__leaddesk__leaddesk_find_leads",
  "input": {
    "status": "contacted",
    "limit": 50
  }
}
```

Відповідь сервера (сирий вигляд):

```json
{
  "leads": [
    { "id": "lead_0002", "company": "Rynok Books", "status": "contacted", "source": "webinar", "budget": 500, "createdAt": "2026-09-13T00:52:02.043Z" },
    { "id": "lead_0008", "company": "Brick & Beam", "status": "contacted", "source": "website", "budget": 1500, "createdAt": "2026-09-10T21:30:58.988Z" },
    { "id": "lead_0014", "company": "Nova Dental", "status": "contacted", "source": "facebook-ads", "budget": 2500, "createdAt": "2026-07-27T20:15:23.380Z" },
    { "id": "lead_0003", "company": "Metro Logistics", "status": "contacted", "source": "facebook-ads", "budget": 10000, "createdAt": "2026-07-18T00:14:44.381Z" },
    { "id": "lead_0009", "company": "North Wind Yachts", "status": "contacted", "source": "webinar", "budget": 2500, "createdAt": "2026-06-27T14:53:21.060Z" }
  ]
}
```

Висновок: `lead_0003` належить Metro Logistics і має статус `contacted`, тож зміну можна робити.

### 3. Зміна статусу

```json
{
  "tool": "mcp__leaddesk__leaddesk_set_lead_status",
  "input": {
    "leadId": "lead_0003",
    "status": "lost",
    "reason": "Лід відмовився: Metro Logistics обрали іншу агенцію."
  }
}
```

Відповідь сервера (сирий вигляд):

```json
{
  "lead": {
    "id": "lead_0003",
    "company": "Metro Logistics",
    "status": "lost",
    "source": "facebook-ads",
    "budget": 10000,
    "createdAt": "2026-07-18T00:14:44.381Z"
  },
  "audit": {
    "action": "status:contacted->lost",
    "leadId": "lead_0003",
    "at": "2026-10-12T19:26:44.144Z",
    "reason": "Лід відмовився: Metro Logistics обрали іншу агенцію."
  }
}
```

### 4. Перевірка після зміни

```json
{
  "tool": "mcp__leaddesk__leaddesk_find_leads",
  "input": {
    "status": "lost",
    "limit": 50
  }
}
```

Відповідь сервера (сирий вигляд):

```json
{
  "leads": [
    { "id": "lead_0007", "company": "Rynok Books", "status": "lost", "source": "referral", "budget": 5000, "createdAt": "2026-07-26T23:16:04.124Z" },
    { "id": "lead_0020", "company": "UrbanFit Studio", "status": "lost", "source": "referral", "budget": 2500, "createdAt": "2026-07-24T12:31:19.113Z" },
    { "id": "lead_0003", "company": "Metro Logistics", "status": "lost", "source": "facebook-ads", "budget": 10000, "createdAt": "2026-07-18T00:14:44.381Z" }
  ]
}
```

Висновок: `lead_0003` тепер у статусі `lost`, а лідів у цьому статусі стало 3.

### 5. Відповідь асистента

`lead_0003` (Metro Logistics) переведено зі статусу `contacted` у `lost`.

- Аудит-запис: `status:contacted->lost`, 2026-10-12 19:26:44 UTC.
- `reason`: «Лід відмовився: Metro Logistics обрали іншу агенцію.»
- Повторне читання підтвердило зміну.
- Інших лідів не змінювали.
- У цього ліда був найбільший бюджет у системі (10000).
