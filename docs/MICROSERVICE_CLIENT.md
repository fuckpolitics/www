# Универсальный gRPC-клиент

Библиотека `@www/grpc-client` даёт единый способ вызывать методы микросервисов по дескрипторам из `Microservices` (`@www/common`).

## Подключение

```typescript
import { MicroserviceClientModule } from '@www/grpc-client';

@Module({
  imports: [MicroserviceClientModule],
  // ...
})
export class AppModule {}
```

```typescript
import { MicroserviceClientService } from '@www/grpc-client';
import { Microservices } from '@www/common';

@Injectable()
export class MyService {
  constructor(private readonly microserviceClient: MicroserviceClientService) {}

  async example() {
    const user = await this.microserviceClient.call(Microservices.user.getUser, { id: '123' });
    const login = await this.microserviceClient.call(Microservices.auth.login, { email: 'a@b.com', password: 'p' });
  }
}
```

## API

- **`call(descriptor, data): Promise<T>`** — вызов метода по дескриптору. Дескриптор — объект `{ service, method }` из `Microservices` (например `Microservices.auth.register`, `Microservices.user.getUserByEmail`).

Конфигурация: `libs/grpc-client/src/microservices.config.ts`. Добавление сервиса — запись в `MICROSERVICES_CONFIG` с ключом в нижнем регистре и соответствующий раздел в `libs/common/src/const/microservices.ts` (MICROSERVICES).
