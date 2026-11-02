# Рефакторинг регистрации

Дата:2026-11-02. Ветка:0006-registration-refactor.

Цель: убрать логирование данных регистрации и ошибок, сохранить создание пользователя внутри новой компании, ограничить POST /auth/register одним запросом с IP за10секунд. При превышении HTTP429 с message «Существует лимит на частоту регистрации. Попробуйте позже». Считаются все попытки, включая невалидные и неуспешные; отклонённые попытки не продлевают окно. Login не ограничивать этой логикой.

Аудит: AuthService.register уже передаёт companyId созданной компании в UsersService.createUser с ADMIN и создаёт сессию. Удалить console.log(userDto)/console.log(e), связь подтвердить regression test. DTO и ответ id/name/roles/token сохраняются; frontend HandlerAxiosError уже обрабатывает message, проверить это.

Решение: отдельный singleton Nest guard только на регистрации, in-memory IP→expiry с очисткой истёкших записей, интервал10000ms и Retry-After. IP брать из Express request.ip, не из пользовательского заголовка вручную. В production явно доверять одному proxy через TRUST_PROXY=1 (backend не публикуется); Nginx перезаписывает X-Forwarded-For адресом клиента, dev остаётся trust proxy=false. Так не объединяем всех посетителей под IP Nginx и не даём клиенту подставлять произвольный IP через заголовок. Инфраструктура текущая — один backend process; рестарт сбрасывает счётчик, для нескольких реплик потребуется общий store, не добавлять Redis без необходимости.

Этапы: tests guards/time/IP и AuthService company binding; реализация guard/module/controller и удаление logging; proxy/main/Compose; HTTP integration без AppModule/БД, backend build/tests, frontend build и Nginx/Compose validation. Схема/данные/миграции/пользователи существующей БД не изменяются. Production/Analysis не обновлять без отдельного указания. Не создавать реальные компании для smoke, использовать mock service в HTTP harness.

Риски: ошибочное доверие заголовкам; хранение expired IP; случайное изменение login или frontend ошибки; проверить прямые/проксированные запросы, spoof headers и разные IP, границу10сек, точное сообщение и отсутствие вызова регистрации при429. Сохранение companyId/ADMIN/ответа и отсутствие logging проверять unit test.

Rollback: вернуть guard и конфигурацию proxy с кодом через Git; схемы/данных для отката нет. Критерии: одна попытка наIP/10сек, разныеIP независимы, ошибка видна существующим frontend обработчиком, пользователь связан с созданной компанией, DTO/пароли не логируются.
