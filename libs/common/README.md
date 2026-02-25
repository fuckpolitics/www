# Common

Общие proto-файлы, DTO, сущности и константы для микросервисов и API Gateway.

## Структура

```
libs/common/src/
├── proto/        # .proto файлы
├── dto/          # Интерфейсы запросов/ответов
├── entities/     # TypeORM-сущности (User, AuthCredential, RefreshToken)
├── const/        # proto, microservices (MICROSERVICES, getMethodAccess)
├── decorators/   # Grpc(Microservices.user.getUser)
└── index.ts
```

## Использование

```typescript
import {
  GetUserRequest,
  GetUserResponse,
  Grpc,
  Microservices,
  User,
  entities,
  PROTO_FILES,
} from '@www/common';
```

Proto-файлы: `libs/common/src/proto/`. В конфигах gRPC используйте `PROTO_PATHS` или путь `libs/common/src/proto/<name>.proto`.

Добавление нового proto: файл в `src/proto/`, DTO в `src/dto/`, экспорт в `index.ts`; метод в `const/microservices.ts`.
