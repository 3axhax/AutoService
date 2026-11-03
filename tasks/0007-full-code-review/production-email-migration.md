# Production email uniqueness — готово к согласованию

2026-11-03. Пользователь разрешил доставку задачи 0007. SSH восстановился; чистый /var/AutoService на main обновлён через git pull --ff-only origin main до 750b5dc. Новые приложения ещё не запускались.

## Read-only preflight

В production: 0 групп дублей lower(btrim(email)); индекс users_email_normalized_unique отсутствует; отметка add_users_normalized_email_unique отсутствует. По diff startup workflow единственный новый migration call — applyEmailUniqueness. Данные пользователей не выводились и не менялись.

## Готовая миграция

При запуске нового backend штатная applyEmailUniqueness в одной транзакции берёт migration advisory-lock, повторно проверяет дубли, создаёт UNIQUE INDEX users_email_normalized_unique ON users(lower(btrim(email))) и добавляет одну отметку migrations. Существующие email/пароли/пользователи/заказы не переписываются. Индекс кратковременно может блокировать запись users. При дублях миграция прекращается с rollback, без удаления/объединения учётных записей.

## Резервная копия и откат

На сервере до pull создан pg_dump -Fc (100369 bytes) в закрытом tmp/0007-deploy/; точный путь хранится в backup-path, SHA256 — backup-sha256. Каталог pg_restore читается, весь архив успешно прочитан pg_restore --file=/dev/null. Восстановление в отдельную БД в этом проходе не выполнялось. Backup не помещается в Git/документацию с данными. Сохранены rollback-теги before-0007-eef02d4 для server/client. До перезапуска записаны baseline ID/image/start time всех контейнеров. Analysis не меняется.

В случае ошибки запуска вернуть старые image IDs/теги и пересоздать только два приложения AutoService. Удаление индекса/отметки либо восстановление БД требует отдельного согласования; автоматически DROP/restore не выполнять. Остальные данные не изменять.

## Следующий шаг после подтверждения

Завершить последовательную сборку обеих production images из Git checkout ограниченным builder (512 MiB, 0.5 CPU), остановить builder. После отдельного явного разрешения schema migration: повторить read-only audit, сохранить актуальный backup при необходимости, выполнить up --no-build --no-deps --wait только server_auto_service/client_auto_service. Затем проверить valid/unique индекс и единственную отметку, health/API/защиту и неизменность DB/Analysis containers. Не выполнять down -v.

Подтверждение требуется по tasks/README.md:63–65: «Без отдельного плана, резервной копии и явного подтверждения не выполняй: migrations/DDL и восстановление дампа». Предыдущее согласование email-миграции относилось к локальной БД; здесь целевая БД production.


## Итог подготовки

Обе production images успешно собраны из 750b5dc: backend 5ed07324d995, frontend 1e2f089874b8; теги review-750b5dc и latest. Ограниченный builder остановлен. Дальнейший шаг — только после явного согласования production-миграции. Файл является планом к рассмотрению, а не отметкой применения DDL.


## Применено после согласования

2026-11-03 пользователь явно разрешил обновление рабочей БД. Перед применением повторены read-only проверки: дублей 0, индекса нет. Создан новый pg_dump -Fc (100369 bytes), каталог и весь архив проверены pg_restore; путь и SHA256 сохранены на сервере в approved-backup-path/approved-backup-sha256. Восстановление дампа не выполнялось.

Через production Compose пересозданы только server_auto_service и client_auto_service из готовых review-750b5dc images. Штатная startup migration создала users_email_normalized_unique; indisunique=true, indisvalid=true, marker add_users_normalized_email_unique ровно один. Перед/после сняты counts/SQL fingerprints 15 таблиц. Изменилась только migrations (+1 строка); пользователи, операционные и справочные строки совпали. После auth smoke все таблицы совпадают с post-migration снимком: временные тестовые сессии отозваны.

Оба приложения healthy и совпадают с подготовленными image IDs, builder exited. PostgreSQL/Analysis container IDs/images/start times не менялись. Внешние /, /health, /api/ — HTTP200; анонимные защищённые запросы —403. Для двух учётных записей из testData/dev.json: login201, защищённое чтение200/201, некорректный delete400 без записи, logout200, отозванный bearer403. Секреты/ответы с пользовательскими данными не выводились. Rollout завершён, backup и rollback images сохранены. Документация доставляется последующим Git pull без пересборки приложений.
