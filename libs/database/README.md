# Database

Библиотека для миграций TypeORM и фабрики DataSource.

## Использование

```typescript
import {
  createDataSource,
  createMigrationsConfig,
  runMigrations,
  revertMigration,
  showMigrations,
  DatabaseConfig,
} from '@www/database';
import { entities } from '@www/common';

const config = createMigrationsConfig(entities, 'db/migrations/*.ts');
runMigrations(config);
```

Конфиг миграций в проекте: `db/config.ts`. Команды: `npm run mg:run`, `npm run mg:r`, `npm run mg:s` (скрипты вызывают CLI из этой библиотеки).

Переменные окружения: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_LOGGING`.
