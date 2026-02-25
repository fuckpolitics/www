# Универсальный endpoint для микросервисов

## Endpoint

```
POST /api/microservice
```

## Тело запроса

```json
{
  "service": "user",
  "method": "getUser",
  "data": { "id": "123" },
  "token": "Bearer..."
}
```

| Поле | Описание |
|------|----------|
| `service` | Имя сервиса в нижнем регистре: `user`, `auth` |
| `method` | Метод в camelCase: `getUser`, `createUser`, `login` |
| `data` | Объект с данными (опционально) |
| `token` | JWT для методов с `requiresAuth` (опционально) |

Метод автоматически преобразуется в формат gRPC: `getUser` → `User.getUser`.

## Пример

```bash
curl -X POST http://localhost:3000/api/microservice \
  -H "Content-Type: application/json" \
  -d '{"service": "user", "method": "getUser", "data": {"id": "123"}}'
```

Успешный ответ: `{"success": true, "data": {...}}`. Ошибка: `{"success": false, "error": "..."}` или HTTP 400/401/403.

## Ограничения доступа

- Методы с флагом **isInternal** недоступны через API (403).
- Методы с флагом **requiresAuth** требуют валидный `token` в теле запроса (401 при отсутствии или невалидном токене).

Конфигурация флагов: `libs/common/src/const/microservices.ts`.
