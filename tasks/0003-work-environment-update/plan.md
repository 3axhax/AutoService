# Обновление рабочего окружения

Дата: 2026-11-02. Ветка: `0003-work-environment-update`.

## Цель и границы

Подготовить независимые Docker Compose окружения для локальной разработки и production AutoService на общем с Analysis сервере. Production доступен по IP и отдельному порту (по умолчанию 8080), без домена. Не подключаться к серверу, не доставлять изменения, не менять Analysis, существующие env-файлы и persistent volumes.

## Текущее и ожидаемое поведение

Существующий `docker-compose.yaml` запускает Vite и Nest watch с bind mounts, публикует БД и API. `client/src/shared/transport/RestAPI.ts` жёстко использует порт 5050. Общий пакет `packages/pricing` собирается в обоих образах. Production должен запускать собранный backend и Nginx со статикой и /api; БД и API доступны только внутри отдельной Compose-сети.

## Решение

Сохранить стандартный compose как local dev, добавить самостоятельный `docker-compose.prod.yaml` с отдельным project name/volume. В существующих Dockerfile выделить development и production targets; использовать npm ci и многостадийную сборку. Dev сохраняет прежний project name и pgdata; production не использует fixed container_name. Настройки production передаются из отдельного игнорируемого env-файла с обязательными DB credentials. API URL /api общий для обоих окружений: Vite proxy локально, Nginx proxy в production. Настраиваемый VITE_BASE_API_URL сохраняется.

Отвергнуты: dev-серверы на production; общий proxy/БД/сеть с Analysis; публикация второго PostgreSQL на 5432. PostgreSQL 12 пока сохраняется для совместимости текущего volume; обновление версии — отдельная задача с миграцией.

## Этапы и файлы

1. Dockerfile client/server, dockerignore и dev Compose.
2. Production Compose, Nginx, env example и инструкция запуска.
3. RestAPI и Vite proxy; актуализация устойчивых сведений AGENTS.md.
4. Validate Compose, собрать оба режима, проверить Nginx, SPA и /api на изолированном smoke-стеке без реальной БД; backend tests и проверки runtime dependencies.

## Данные и безопасность

API/схема и данные не меняются. Не запускать приложение на существующей БД: startup sync/seed/миграции сохраняют текущее поведение и требуют отдельного плана при поставке. Изменений users/orders/shifts/sessions не требуется. Не включать secrets/testData/tmp/дампы в Docker context. Production backend работает от непривилегированного пользователя, без watch/debug, БД и API без host ports. HTTP по IP без TLS: для публичного рабочего использования требуется отдельно настроить TLS или VPN; конфигурация не обещает шифрование.

## Приёмка и rollback

Оба compose валидны; Docker targets собираются; production runtime содержит собранный pricing и только runtime dependencies; Nginx отдаёт SPA, /api проксируется без префикса, healthcheck работает; существующий dev volume не переименован; публичный порт production только 8080. Проверить diff/secrets и контейнеры. Откат конфигурации через Git; данные не меняются, восстановление БД не требуется. Перенос и реальные startup migrations не выполнять.

## Дополнение: первая поставка на сервер

2026-11-02 пользователь явно разрешил commit/merge/push, подключение к рабочему серверу, создание /var/AutoService, развёртывание production и перенос локальной БД.

Порядок: проверить diff и секреты → commit → fetch/merge в main → push обеих веток → read-only аудит сервера (место/RAM/порты/существующий каталог, контейнеры/volumes) → Git clone/pull в /var/AutoService → отдельные production credentials и сборка → согласованный пользовательским запросом перенос проверенного локального custom dump по SSH только в новую БД AutoService до запуска backend → сравнение таблиц/числа строк и проверка хешей учётных записей → запуск backend/frontend → HTTP/auth smoke и сверка неизменности Analysis.

Исходники доставляются только Git; дамп БД передаётся отдельно по прямому запросу пользователя и не попадает в репозиторий. Локальный dump хранится в игнорируемом DumpDB с правами 0600, проверяется pg_restore --list. Целевые существующие данные не перезаписывать: при обнаружении непустой AutoService DB сначала аудит и backup. Перед изменениями сохранить обезличенный baseline контейнеров Analysis (id/image/StartedAt), после поставки сравнить. Не перезапускать Analysis/proxy и не публиковать второй PostgreSQL порт.

Rollback первой поставки: остановить только новый стек AutoService; сохранить его volume и локальный проверенный dump. Порт по умолчанию 8080 использовать только если свободен; при занятом выбрать свободный отдельный порт и документировать. Schema startup migrations являются существующим поведением приложения, пользовательский запрос разрешает запуск; проверить состояние до и после.
