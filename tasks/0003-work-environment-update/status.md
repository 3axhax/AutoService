# Статус

- Принят: аудит текущих Dockerfile, Compose, API-клиента, pricing и конфигурации Analysis. Предыдущие пользовательские изменения сохранены.
- Принят: development/production targets, отдельный production Compose, Nginx /api, env example и инструкция запуска добавлены. Existing env-файлы и данные не изменялись.
- Принят: обе Compose-конфигурации валидны; обе пары образов собраны. Production backend запускается от node, pricing/bcrypt/pg загружаются, env-файлов и TypeScript в runtime нет; nginx -t успешен.
- Принят: backend unit tests — 1 suite, 2 tests. Nginx smoke — SPA fallback, health, /api, query, POST body, Bearer и redirect успешны.
- На проверке: завершается dev Vite smoke и итоговый контроль diff/контейнеров.
- Ограничение: существующая БД и startup migrations не запускались. Перенос на сервер и изменение Analysis не выполнялись.

2026-11-02: первый общий HTTP smoke завершился тайм-аутом готовности Vite при обращении по Docker hostname (стандартная защита Host). Повторная проверка выполняется через localhost внутри сетевого пространства контейнера, без ослабления настроек Vite. Production HTTP проверки пройдены.

2026-11-02, завершение:
- Принят: повторный dev Vite smoke прошёл; Host-защита сохранена.
- Принят: контроль Compose isolation, git diff --check и git status успешен; временные контейнеры удалены, AutoService остановлен, существующая БД не запускалась.
- Принят: implementation.md и deploy/README.md содержат фактические проверки, порядок запуска/отката и ограничения. Сборка выявила существующие npm vulnerabilities и CSS/bundle warnings; обновление зависимостей не выполнялось.
- На проверке пользователя: готовые файлы обоих окружений. Перенос и первый production запуск не выполнялись согласно запросу.

2026-11-02, локальный запуск по отдельному запросу пользователя:
- Принят: docker compose up -d --build --renew-anon-volumes — локальные client/server пересобраны, все три контейнера запущены; именованный volume БД сохранён.
- Проверка: PostgreSQL healthy; frontend http://localhost:5173/, backend http://localhost:5050/ и proxy http://localhost:5173/api/ вернули HTTP 200.
- Backend запущен обычным bootstrap, включая существующий механизм startup migrations. Production и Analysis не затронуты.

2026-11-02, первая поставка разрешена пользователем:
- В работе: commit/merge/push, read-only аудит сервера, отдельный production Git checkout и перенос локальной БД.
- Прямое указание пользователя включает дамп/перенос БД и запуск backend; Analysis не изменять. Полный план добавлен в plan.md.

2026-11-02, аудит сервера:
- Принят: исходный commit 31cf426 слит fast-forward в main и обе ветки отправлены в origin.
- Принят: подключение к серверу; /var/AutoService отсутствует, 8080 свободен; Analysis использует 80/443/5432, собственные networks/volume.
- Уточнение решения по факту ресурсов: сервер 2 GiB RAM, доступно около 740 MiB, swap нет. Добавлены production memory/CPU limits (backend 256 MiB, DB 128 MiB, client 64 MiB); сборка — последовательная через отдельный ограниченный builder. Analysis не меняется.
