# gRPC Client

Универсальный клиент для вызова микросервисов по дескрипторам из `Microservices` (`@www/common`).

## Использование

```typescript
import { MicroserviceClientModule } from '@www/grpc-client';

@Module({ imports: [MicroserviceClientModule] })
export class AppModule {}
```

```typescript
import { MicroserviceClientService } from '@www/grpc-client';
import { Microservices } from '@www/common';

constructor(private readonly client: MicroserviceClientService) {}

await this.client.call(Microservices.user.getUser, { id: '123' });
await this.client.call(Microservices.auth.login, { email: 'a@b.com', password: 'p' });
```

Конфигурация: `libs/grpc-client/src/microservices.config.ts`. Добавление сервиса — запись в `MICROSERVICES_CONFIG` (ключ в нижнем регистре) и раздел в `libs/common/src/const/microservices.ts`. Proto-пути — `libs/common/src/proto/`.
