# Миграции базы данных

Механизм TypeORM миграций вынесен в библиотеку `@www/database`. Конфигурация и скрипты — в `db/`, логика — в `libs/database`.

## Структура

```
db/
├── migrations/       # Файлы миграций
├── config.ts        # Конфиг (entities из @www/common, путь к migrations)
├── data-source.ts   # DataSource для typeorm CLI (генерация миграций)
└── tsconfig.json

libs/database/
├── src/
│   ├── data-source.factory.ts  # createDataSource, createMigrationsConfig
│   ├── migration-runner.ts     # runMigrations, revertMigration, showMigrations
│   └── cli/                    # Точки входа для скриптов
```

## Команды

| Действие | Команда |
|----------|---------|
| Запуск миграций | `npm run mg:run` |
| Откат последней | `npm run mg:r` |
| Статус | `npm run mg:s` |
| Создать пустую миграцию | `npm run mg:c -- MigrationName` |
| Сгенерировать из entities | `npm run mg:g -- MigrationName` |

## Переменные окружения

В корневом `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=www
DB_LOGGING=false
DB_MIGRATIONS_RUN=false   # true — запускать миграции при старте приложения
DB_SYNCHRONIZE=false     # Должно быть false при использовании миграций
```

## Добавление новой entity

1. Создайте entity в `libs/common/src/entities/` и добавьте в `libs/common/src/entities/index.ts` (экспорт + массив `entities`).
2. Сгенерируйте миграцию: `npm run mg:g -- DescribeYourChange`.

Конфиг `db/config.ts` подхватывает все entities из `@www/common`, вручную ничего дописывать не нужно.

## Правила

- Не используйте `synchronize: true` в production.
- Не меняйте уже применённые миграции.
- Перед production проверяйте откат: `npm run mg:r`.

## Ссылки

- [TypeORM Migrations](https://typeorm.io/migrations)
- [TypeORM DataSource](https://typeorm.io/data-source)
