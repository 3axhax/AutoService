# Результат подготовки окружений

Дата: 2026-11-02. Ветка: `0003-work-environment-update`. Поставка на сервер не выполнялась.

## Что изменено

- `docker-compose.yaml` остаётся локальным окружением. Использует development targets, bind mounts client/server, loopback-порты 5173/5050/5432; существующие контейнерные имена и volume autoservice_pgdata сохранены. Внутренний адрес БД и PORT заданы явно. Неиспользуемая публикация 9229 удалена.
- `docker-compose.prod.yaml` — самостоятельное окружение autoservice-prod с отдельными сетью/volume, без fixed container_name и bind mounts. Единственный host port — настраиваемый 8080. Backend и БД не публикуются. DB credentials обязательны, healthchecks и restart policies настроены.
- Оба Dockerfile содержат development/production targets. npm ci использует существующие lock-файлы. Общий pricing собирается до client/server; production backend сохраняет symlink-зависимость pricing, включает только runtime dependencies и запускается от node. Production frontend — собранная статика в Nginx.
- RestAPI использует VITE_BASE_API_URL с fallback /api; оба контейнерных окружения задают /api явно. Vite и Nginx удаляют префикс перед передачей в backend. Nginx поддерживает SPA fallback, /health и обновление Docker DNS для пересозданного backend.
- Добавлены deploy/nginx.conf, deploy/.env.production.example и deploy/README.md. Production env исключён из Git; build context исключает secrets, tmp, env, dumps, testData и локальные артефакты. Реальные существующие env-файлы не менялись.
- Обновлены устойчивые сведения об окружениях и API proxy в AGENTS.md; ранее добавленная пользователем инструкция доставки сохранена.

## Проверки

Успешно:

1. docker compose config --quiet; production config --quiet с фиктивными непустыми DB variables (без запуска сервисов).
2. docker compose build и production compose build: обе пары образов собраны, TypeScript/Vite/Nest build прошли.
3. Production runtime: UID не root; pricing, pg, bcryptjs загружаются; dist/main.js присутствует; TypeScript/dev env-файлов нет.
4. nginx -t в production image.
5. Backend npm test -- --runInBand: 1 suite, 2 tests passed, без сети и БД.
6. Изолированные HTTP smoke checks с тестовым echo backend вместо приложения: production Nginx и development Vite отдают SPA и fallback; /api удаляется; query, POST JSON body и Authorization Bearer сохраняются. Для production дополнительно /health 200, /api redirect 308 и /api/ → backend /.
7. JSON-аудит Compose: прежнее имя dev volume; отдельный production volume/project; соответствующие build targets; dev порты только loopback; production один внешний порт; нет production bind mounts и fixed container names.
8. git diff --check и git status; реальные секретные файлы игнорируются. Временные smoke-контейнеры и сеть удалены, AutoService на существующей БД не запускался.

Первый HTTP smoke остановился на Host-защите Vite при Docker hostname; проверка повторена через localhost внутри сетевого пространства контейнера и успешна. Конфигурация защиты не ослаблялась.

## Данные, поставка и откат

Схема/API/backend logic и существующие данные не изменялись. Заказы, смены, пользователи и сессии не затронуты. Startup migrations на существующей или удалённой БД не выполнялись. Доступ к удалённому серверу и файлу prod secrets не использовался. Analysis не менялся.

Порядок запуска, настройки, дальнейшей Git-доставки и отката описан в deploy/README.md. Для production требуется локально заполненный игнорируемый env. Первый запуск не импортирует dev.json/локальную БД: bootstrap использует существующие initialData и migrations. Перед первым запуском отдельно согласовать исходные данные и безопасные аккаунты. Откат конфигурации/кода через Git с пересборкой образов; миграции/восстановление БД — отдельно. Не удалять volumes.

## Ограничения

- Реальный backend startup с production БД, авторизация по HTTP и сквозной поток заказов не проверялись: проверка не должна запускать существующие startup migrations или менять данные. Проверены сборка, runtime dependencies, unit tests и инфраструктурное проксирование с тестовым backend.
- HTTP по IP не предоставляет TLS. Подготовлены настраиваемый bind address и инструкции по закрытому доступу; TLS/VPN остаются настройкой целевого сервера.
- PostgreSQL 12 сохранён без миграции major-версии. Переход на поддерживаемую версию — отдельная задача.
- npm при сборке backend runtime сообщил 21 vulnerability (9 moderate, 11 high, 1 critical). Lock-файлы и зависимости в этой задаче не обновлялись; аудит и исправление зависимостей остаются до постоянной production-эксплуатации.
- Client build успешен с существующими предупреждениями CSS и размера bundle; оптимизация не входит в задачу.
- Pricing изменяется через пересборку обоих образов; hot reload исходников pricing отдельно не добавлен. Для обновления dev node_modules после lock-изменений описан --renew-anon-volumes.

## Последующий локальный запуск

2026-11-02 по отдельному запросу пользователя выполнено `docker compose up -d --build --renew-anon-volumes`. Все три локальных контейнера работают; PostgreSQL healthy. Frontend на localhost:5173, backend на localhost:5050 и API proxy на localhost:5173/api/ ответили HTTP 200. Именованный volume БД сохранён. Это обычный запуск backend с существующим startup-механизмом миграций; прежнее ограничение «backend на существующей БД не запускался» относится к этапу подготовки образов. Production и Analysis не затронуты.

## Первая production поставка

2026-11-02 пользователь явно разрешил commit/merge/push, создание /var/AutoService, развёртывание и полный перенос локальной БД. Это отменяет ограничение предыдущего этапа «перенос не выполнять» только для текущей поставки.

Подготовка закоммичена (31cf426), слита fast-forward в main, обе ветки отправлены в origin. После read-only аудита сервера добавлена ресурсная изоляция (89b5e3a, d6b4e62): backend 256 MiB/0.5 CPU с heap 192 MiB, PostgreSQL 128 MiB/0.5 CPU с shared_buffers 32 MiB/max_connections 40, Nginx 64 MiB/0.25 CPU. На сервере 2 GiB RAM и 1 CPU; образы собраны последовательно из Git checkout через отдельный Docker-container builder с лимитами 512 MiB и 0.5 CPU. Глобальный builder не переключался, после сборки новый builder остановлен. Образы помечены latest и d6b4e62; изменения этого commit относительно исходного build checkout касались только PostgreSQL command и документации, application sources/Dockerfile не менялись.

Репозиторий клонирован в /var/AutoService, ветка main, выполнен git pull --ff-only. Production credentials сгенерированы отдельно на сервере в игнорируемый deploy/.env.production (0600); dev env-файлы не использованы для подключения production. Порт 8080 и целевой volume до поставки были свободны/отсутствовали.

### Перенос данных

Локальный backend кратко остановлен для согласованного снимка и сразу запущен обратно. Создан custom pg_dump без владельцев/ACL в игнорируемом DumpDB (0600), pg_restore --list успешен; дамп передан по SSH в защищённый tmp каталога AutoService, SHA-256 совпал. Перед записью подтверждено, что новая БД AutoService не содержит public tables. pg_restore выполнен --single-transaction --exit-on-error --no-owner --no-privileges до первого запуска backend.

Все 15 public tables совпали с локальным снимком по counts и fingerprints всего содержимого; повторная проверка после startup migrations также полностью совпала. Пользователи/пароли и операционные данные перенесены из БД, initialData их не подменили. По итогам проверки входа создано ровно две новые production sessions; остальные 14 таблиц не изменились. Секретные данные и хеши не включались в отчёт/Git/вывод инструмента. Проверенные локальный и серверный dump сохранены для отката; restore log имеет ограниченный доступ и не публикуется.

### Приёмка и отсутствие конфликтов с Analysis

- Все три production контейнера healthy, RestartCount 0, OOMKilled false. Nginx, /health, /api/ и SPA fallback проверены как с сервера, так и снаружи по публичному IP:8080, HTTP 200.
- Через SSH/localhost проверен вход двух пользователей из dev.json, admin-доступ к companies, отсутствие admin-доступа у worker, отказ без токена и при неверном пароле. Пароли и выданные токены не выводились.
- AutoService имеет отдельные autoservice-prod_default (CIDR не пересекается с сетями Analysis) и autoservice-prod_pgdata. Нет общих сетей, volumes или bind mounts с Analysis; порты backend/DB не опубликованы. Реальный pg Client из backend подключился к PostgreSQL IP именно контейнера AutoService, своей database и role.
- Все 5 Analysis контейнеров до/после совпали по ID, image, StartedAt, RestartCount, port bindings, network settings и mounts. Порядок mounts нормализован, поскольку Docker inspect может выдавать его произвольно. Никакие restart/reload/config/DB команды к Analysis не применялись. Его HTTPS отвечает 200 до, во время и после поставки.
- После запуска потребление AutoService: nginx ~3 MiB, backend ~116 MiB, DB ~62 MiB; сервер имеет ~673 MiB available RAM и ~11 GiB свободного диска. Ресурсные лимиты установлены и проверены. Общие физические CPU/диск/сеть сервера остаются общими ресурсами; это не обещание отсутствия конкуренции при любой будущей нагрузке.

Production migration теперь выполнена, поэтому ограничения предыдущих этапов «real backend/DB/auth не проверялись» описывают только состояние до этой поставки. Новых migrations/DDL/массовых исправлений данных в исходники не добавлено; использован штатный startup приложения.

### Последующие релизы и rollback

README обновлён: на общем сервере использовать последовательный ограниченный builder и up --no-build, чтобы случайная параллельная сборка не конкурировала с Analysis. После изменения только документации достаточно Git pull, контейнеры перезапускать не нужно.

Для отката первой поставки остановить только autoservice-prod через его production Compose; volume и проверенный dump сохранить. Не применять down -v, не затрагивать Analysis. Локальные данные сохранены и local stack продолжает работать. При восстановлении dump в уже используемую production БД сначала согласовать план и сохранить её текущую копию; первоначальный dump — снимок на момент переноса, не непрерывная репликация.
