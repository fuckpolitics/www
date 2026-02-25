# Общая библиотека common

Proto-файлы и DTO живут в `libs/common`, чтобы не дублировать их между микросервисами и API Gateway.

## Структура

```
libs/common/src/
├── proto/           # .proto файлы
├── dto/             # Интерфейсы запросов/ответов
├── entities/        # TypeORM-сущности (User, AuthCredential, RefreshToken)
├── const/           # PROTO_PATHS, PROTO_FILES, MICROSERVICES, getMethodAccess
├── decorators/      # Grpc(Microservices.user.getUser) и т.п.
└── index.ts
```

## Использование

- DTO и типы: `import { GetUserRequest, ... } from '@www/common'`.
- Декоратор и дескрипторы методов: `import { Grpc, Microservices } from '@www/common'`.
- Сущности для БД: `import { User, entities } from '@www/common'`.
- Proto-пути для конфигов: `PROTO_PATHS`, `PROTO_FILES` из `@www/common`.

## Добавление нового proto

1. Добавить `.proto` в `libs/common/src/proto/`.
2. Описать DTO в `libs/common/src/dto/` и экспортировать в `index.ts`.
3. Добавить метод в `libs/common/src/const/microservices.ts` (и при необходимости `requiresAuth`/`isInternal`).
4. В сервисе использовать `@Grpc(Microservices.xxx.yyy)` и импорт DTO из `@www/common`.
5. В webpack микросервиса при необходимости копировать proto из `libs/common/src/proto/`; в grpc-client конфиг уже указывает на `libs/common`.
