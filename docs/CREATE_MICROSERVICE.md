# Создание нового микросервиса

Краткий путь описан в [QUICK_START_MICROSERVICE.md](./QUICK_START_MICROSERVICE.md). Ниже — основные шаги с учётом текущей структуры (proto и DTO в `libs/common`, конфиг в `libs/grpc-client`).

## 1. Приложение

```bash
npx nx g @nx/nest:app my-service
```

## 2. Proto и DTO в libs/common

- Добавьте `libs/common/src/proto/my.proto` (syntax, package, service, messages).
- Добавьте DTO в `libs/common/src/dto/` и экспорты в `libs/common/src/index.ts`.
- В `libs/common/src/const/microservices.ts` добавьте ветку для сервиса и методов (по образцу `user`/`auth`). При необходимости укажите `requiresAuth` или `isInternal`.
- В `libs/common/src/const/proto.ts` добавьте путь к proto в `PROTO_PATHS` и `PROTO_FILES`.

## 3. main.ts микросервиса

Поднять микросервис через `Transport.GRPC`: `package` из proto, `protoPath` — путь к proto после сборки (webpack копирует из `libs/common/src/proto/`, см. `apps/user-service/webpack.config.js` и `main.ts`). URL — из переменной окружения (например `MY_SERVICE_URL`).

## 4. Контроллер и сервис

- Импорт DTO и декоратора: `import { Grpc, Microservices } from '@www/common'`.
- Методы контроллера: `@Grpc(Microservices.my.getData)` и т.д., типы запросов/ответов из `@www/common`.
- Реализация логики в `AppService`.

## 5. Регистрация в API Gateway (grpc-client)

В `libs/grpc-client/src/microservices.config.ts`:

- Добавьте запись в `MICROSERVICES_CONFIG` (name, url, package, protoPath к файлу в `libs/common/src/proto/`).
- Ключ конфига — в нижнем регистре (например `order`).

После этого вызовы через `POST /api/microservice` с `service` и `method` будут работать.

## 6. Webpack

Чтобы proto попадал в dist микросервиса, в `apps/my-service/webpack.config.js` добавьте копирование из `libs/common/src/proto/` по аналогии с user-service/auth-service.

## Полезные ссылки

- [MIGRATION_TO_LIBRARY.md](./MIGRATION_TO_LIBRARY.md) — структура common
- [MICROSERVICE_CLIENT.md](./MICROSERVICE_CLIENT.md) — вызов других сервисов из микросервиса
- [MICROSERVICE_ENDPOINT.md](./MICROSERVICE_ENDPOINT.md) — формат запросов к API Gateway
