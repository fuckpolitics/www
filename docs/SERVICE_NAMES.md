# Названия сервисов и конфигурация

Конфигурация: `libs/grpc-client/src/microservices.config.ts`.

- **Ключ** в `MICROSERVICES_CONFIG` — имя сервиса в нижнем регистре: `user`, `auth`. Это же значение передаётся в поле `service` запроса к API.
- **name** в конфиге — имя сервиса из proto (например `User`, `Auth`), используется для полного имени метода: `User.getUser`.

Добавление нового сервиса: запись в `MICROSERVICES_CONFIG` с ключом в нижнем регистре (например `order`), указать `name`, `url`, `package`, `protoPath` (путь к proto в `libs/common/src/proto/`).
