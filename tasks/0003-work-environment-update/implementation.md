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
