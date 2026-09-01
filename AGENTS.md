# AutoService — инструкции для Codex

## Назначение проекта

AutoService — веб-приложение для автосервиса: администраторы управляют компаниями, пользователями, параметрами заказа и ценами; работники открывают/закрывают смены и создают заказы. Данные хранятся в PostgreSQL.

## Архитектура

- `server/` — NestJS 11 + TypeScript + Sequelize/`sequelize-typescript`.
- `client/` — React 19 + Vite + TypeScript, Redux Toolkit, React Router, Tailwind CSS.
- `postgres_auto_service` — PostgreSQL 12.
- `docker-compose.yaml` поднимает контейнеры `serverAutoService`, `clientAutoService`, `postgresAutoService`.
- Локальные адреса: клиент `http://localhost:5173`, API `http://localhost:5050`, PostgreSQL `localhost:5432`.

### Backend-модули

- `auth` — регистрация/вход и сессии с Bearer-токеном.
- `users`, `roles` — пользователи, роли и связи `users-roles`.
- `companies` — компании.
- `orderParameters`, `orderParametersOptions` — справочник параметров заказа и их опций.
- `companiesParametersOptions` — доступные параметры/опции и зависимости для компании.
- `price` — цены и таблица условий `priceParametersOptionConditions`.
- `shifts` — смены работников.
- `orders`, `ordersOptionValues` — заказы и выбранные значения параметров.
- `additionalWorks` — дополнительные работы.
- `downloadExcel` — экспорт списка заказов в Excel.
- `migrations` — самописные миграции, выполняемые при старте приложения.

Модули подключаются в `server/src/app.module.ts`. Все Sequelize-модели регистрируются там же через `SequelizeModule.forRoot`, а `autoLoadModels` включён.

## Потоки выполнения

### Запуск backend

`server/src/main.ts` создаёт Nest-приложение, включает CORS и глобальный `ValidationPipe` (`transform`, `whitelist`). `AppModule` подключает Sequelize к PostgreSQL и глобальный `AuthGuard`.

При старте:

1. Sequelize синхронизирует модели и таблицы.
2. `@AfterSync` в справочных моделях добавляет данные из соответствующих `*.initialData.ts`, только если таблица пуста.
3. `MigrationService.onModuleInit()` создаёт таблицу `migrations` и выполняет самописные миграции для `users` и `orders`.

`*.initialData.ts` — снимок базовых/текущих справочных данных, а не механизм обновления существующих строк. При изменении уже непустой БД эти файлы автоматически данные не заменяют.

### Авторизация

- `AuthGuard` глобальный, но пропускает запрос без токена; фактическая защита endpoint выполняется `RolesGuard`.
- Защищённые методы используют одновременно `@Roles(...)` и `@UseGuards(RolesGuard)`.
- Сессия хранится в `users-sessions`, токен передаётся как `Authorization: Bearer <token>`.
- Роли: `ADMIN`, `MANAGER`, `WORKER` (`server/src/roles/roles.types.ts`).
- Для admin-пользователей дополнительно учитывается `users.confirmed`.
- Пароли и токены хешируются через `bcryptjs`; не выводить и не переносить секреты в документацию/коммиты.

### Frontend

`client/src/app/AppContainer.tsx` восстанавливает пользователя и настройки из localStorage, определяет тип пользователя и показывает разные страницы:

- admin → `OrdersPage`;
- worker → `WorkerOrderPage`;
- остальные/неавторизованные → `MainPage`.

`client/src/shared/transport/RestAPI.ts` — singleton-обёртка над Axios. Токен берётся из localStorage; фактический URL собирается как текущий host + порт `5050`, поэтому при изменении API-порта нужно проверить этот файл, а не только `client/.env`.

## Модель данных

Основные связи:

`companies` → `users`, `shifts`, `orders`, `price` → `orderParametersOptions`.

`orderParameters` → `orderParametersOptions`.

`price` ↔ `orderParametersOptions` через `priceParametersOptionConditions`; у цены также есть `mainOptionId`.

`users` ↔ `roles` через `users-roles`; `users` → `users-sessions`, `shifts`, `orders`.

Файлы `*.initialData.ts` существуют для девяти справочных таблиц:

- `companies`
- `companiesParametersOptions`
- `orderParameters`
- `orderParametersOptions`
- `price`
- `priceParametersOptionConditions`
- `roles`
- `users-roles`
- `users`

Операционные таблицы `orders`, `ordersOptionValues`, `shifts`, `additionalWorks`, `users-sessions` не имеют initialData-файлов; не экспортировать и не перезаписывать их без прямого указания.

## Правила работы с кодом

1. Перед изменением искать существующий модуль, DTO, модель, controller/service и frontend entity, а не добавлять параллельную реализацию.
2. Сохранять текущие имена таблиц и полей Sequelize, включая camelCase и дефисные таблицы (`users-roles`, `users-sessions`).
3. Для новых входных данных использовать DTO и `class-validator`; не принимать произвольное тело без необходимости.
4. Для endpoint сначала определить требуемую роль и применить существующий паттерн `@Roles` + `RolesGuard`.
5. Для изменений схемы обновлять самописные миграции в `server/src/migrations`, учитывая, что они должны быть идемпотентными и отмечаться в таблице `migrations`.
6. Не считать `sync({ alter: true })` или `@AfterSync` заменой миграций для production.
7. Не менять `.env`, пароли, токены и persistent volume `pgdata` без явного запроса.
8. Сохранять пользовательские незакоммиченные изменения и не добавлять в коммит посторонние `.DS_Store`, выгрузки и документы.
9. Исправляя backend-логику, проверять соответствующий Redux slice/thunk и формат ответа frontend.
10. Имена и структура frontend следуют feature-sliced-подходу: `entities`, `features`, `widgets`, `pages`, `shared`.
11. Для тестов брать информацию для доступов из `testData/dev.json`.

## Известные технические особенности

- CORS разрешает только `GET` и `POST`; при добавлении методов нужно обновлять конфигурацию в `server/src/main.ts`.
- API-клиент сейчас жёстко использует порт `5050`, несмотря на наличие `VITE_BASE_API_URL`.
- В моделях есть ручное обновление sequence после initial data; при добавлении новой модели/таблицы проверять имя sequence и отсутствие конфликтов.
- `companiesParametersOptions.model.ts` обновляет sequence `companiesParametersOptions_id_seq`; при изменении схемы сверять имя sequence с реальной БД.
- В `orders.model.ts` хуки `AfterCreate`/`BeforeDestroy` синхронизируют записи `ordersOptionValues`; изменения жизненного цикла заказа проверять вместе с этими хуками.

## Команды проверки

Из корня проекта:

```bash
docker compose up -d --build
docker compose ps
```

Backend:

```bash
docker exec serverAutoService npm run build
docker exec serverAutoService npm test
```

Frontend:

```bash
docker exec clientAutoService npm run build
```

Для просмотра БД:

```bash
docker exec postgresAutoService psql -U postgres -d auto_service_db
```

Перед завершением задачи проверять `git diff --check`, статус контейнеров и `git status`; коммитить только явно относящиеся к задаче файлы.

## Рабочие задачи

Каждую отдельную задачу, затрагивающую логику работы приложения, веди в `tasks/` по правилам [`tasks/README.md`](tasks/README.md). До реализации создай `plan.md`, в процессе обновляй `status.md`, а после завершения или принятия реализации добавь `implementation.md`.

Организационные изменения, не меняющие поведение приложения, отдельной задачей не оформляй. В `AGENTS.md` держи только устойчивые знания о проекте; детали конкретной реализации, временные SQL, результаты экспериментов и чек-лист приёмки оставляй в каталоге соответствующей задачи.
