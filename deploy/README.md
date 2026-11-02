# Окружения AutoService

## Локальная разработка

Из корня репозитория:

```bash
docker compose up -d --build
docker compose ps
```

Используется `docker-compose.yaml` и development targets. Vite: http://localhost:5173, API для отладки: http://localhost:5050, PostgreSQL: localhost:5432. Порты привязаны к loopback. Существующие имена контейнеров и volume `pgdata` сохранены; не меняйте Compose project name для существующей БД.

Frontend обращается к `/api`; Vite направляет запросы в `server_auto_service:5050`. Запуск Vite вне Docker использует `http://localhost:5050`; `API_PROXY_TARGET` позволяет переопределить адрес. Backend использует существующий `server/.development.env`, PostgreSQL — `server/.postgres.env`; их DB credentials должны совпадать. Compose задаёт внутренний адрес БД и порт API явно. Реальные env-файлы в образы не копируются.

Client/server исходники примонтированы и обновляются автоматически. Общий `packages/pricing` собирается в образ: после его изменения пересоберите оба сервиса. После изменения lock-файлов пересоздайте также анонимные node_modules volumes:

```bash
docker compose up -d --build --renew-anon-volumes server_auto_service client_auto_service
```

Эта команда сохраняет именованный volume БД. Проверки:

```bash
docker exec serverAutoService npm run build
docker exec serverAutoService npm test -- --runInBand
docker exec clientAutoService npm run build
```

Остановка: `docker compose stop`. Не используйте `down -v` для рабочей БД.

## Production: подготовка и первый запуск

Это самостоятельный Compose-файл, его не нужно объединять с локальным. Для него задан отдельный project name `autoservice-prod`, сеть и volume `autoservice-prod_pgdata`; фиксированных имён контейнеров нет. Analysis не используется и не меняется. Единственный внешний порт — HTTP `8080` (настраиваемый); доступ: `http://IP:8080`.

На целевом сервере после доставки через Git создайте локальный файл настроек:

```bash
cp deploy/.env.production.example deploy/.env.production
chmod 600 deploy/.env.production
```

Заполните `POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_PASSWORD` (пароль обязателен); при необходимости измените `AUTOSERVICE_HTTP_PORT` и `AUTOSERVICE_BIND_ADDRESS`. Реальный `deploy/.env.production` исключён из Git и build context. Не используйте dev-пароли. Для значений с `$`, `#` и пробелами используйте одинарные кавычки по правилам Compose env-файлов. Не публикуйте вывод `docker compose config`: он может содержать секреты; используйте `config --quiet`.

До запуска проверьте свободный порт, RAM/диск сервера и firewall. Если публичный HTTP не нужен, задайте `AUTOSERVICE_BIND_ADDRESS=127.0.0.1` и используйте SSH-туннель/VPN. HTTP сам по себе не шифрует пароли и токены; для публичного рабочего доступа требуется отдельная настройка TLS или защищённого канала.

Проверка и сборка без запуска сервисов:

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yaml config --quiet
docker compose --env-file deploy/.env.production -f docker-compose.prod.yaml build
```

Первый запуск **не переносит локальную БД**. При пустой БД существующий backend выполняет sync/initialData/startup migrations. Учётные записи из `testData/dev.json` и их обновлённые пароли автоматически не импортируются. Перед первым запуском отдельно согласуйте начальные данные/аккаунты и план миграций; при обновлении существующей БД — резервную копию и порядок её изменения. Подготовка контейнеров не означает, что такая миграция уже выполнена.

После согласования запуска и данных:

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yaml up -d --build --wait
docker compose --env-file deploy/.env.production -f docker-compose.prod.yaml ps
curl --fail http://127.0.0.1:8080/health
curl --fail http://127.0.0.1:8080/api/
```

При другом порте замените 8080. `/health` проверяет Nginx, `/api/` — доступность backend; дополнительно проверьте вход и защищённые маршруты. Backend healthcheck проверяет HTTP после успешного запуска подключения к БД. Nginx ждёт healthy backend, backend — healthy PostgreSQL. В production нет bind mounts исходников, watch или опубликованного отладчика. Backend запускается от пользователя node, содержит собранный общий pricing и runtime dependencies.

## Дальнейшая доставка и откат

Следуйте `AGENTS.md`: проверки → commit → merge в `main` (если не указана другая ветка) → push → SSH по локальному `tmp/.prod.secrets` → проверка чистоты серверного checkout → `git pull --ff-only origin main` → пересборка и пересоздание изменённых сервисов через production Compose. Простой `restart` не подхватывает новую сборку образа. БД и Analysis при изменении только client/server не пересоздавайте:

```bash
docker compose --env-file deploy/.env.production -f docker-compose.prod.yaml up -d --build --no-deps --wait server_auto_service client_auto_service
```

До обновления зафиксируйте SHA и предыдущие образы. При необходимости верните согласованный предыдущий Git commit и пересоберите client/server; env-файл и volume сохраняйте. Откат схемы/данных — отдельный согласованный план, он не заменяется откатом образа. Не выполняйте `down -v`.

PostgreSQL 12 сохранён ради совместимости текущего окружения; переход на поддерживаемую major-версию с проверкой миграции данных остаётся отдельной задачей перед постоянной эксплуатацией. Текущая подготовка не меняет версию существующей БД.
