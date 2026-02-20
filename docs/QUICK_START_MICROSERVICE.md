# Быстрый старт: новый gRPC-микросервис

1. **Приложение:** `npx nx g @nx/nest:app my-service`

2. **Proto и DTO** — в `libs/common`: добавить `.proto` в `libs/common/src/proto/`, описать DTO в `libs/common/src/dto/`, завести метод в `const/microservices.ts`. В контроллере: `import { Grpc, Microservices } from '@www/common'`, `@Grpc(Microservices.my.getData)`.

3. **main.ts** — поднять микросервис через `Transport.GRPC`, `package` и `protoPath` из `PROTO_FILES`/`PROTO_PATHS` в `@www/common`. Webpack приложения копирует proto из `libs/common/src/proto/` (см. существующий user-service/auth-service).

4. **Регистрация в API Gateway** — в `libs/grpc-client/src/microservices.config.ts` добавить запись в `MICROSERVICES_CONFIG` (ключ — имя сервиса в нижнем регистре, например `user`, `auth`). Proto уже в common, путь к нему — `libs/common/src/proto/...`.

5. **Запуск:** `npx nx serve my-service`, в другом терминале `npx nx serve api-gateway`. Вызов через `POST /api/microservice` с `service` и `method`.

Подробнее: [CREATE_MICROSERVICE.md](./CREATE_MICROSERVICE.md), [MIGRATION_TO_LIBRARY.md](./MIGRATION_TO_LIBRARY.md).
