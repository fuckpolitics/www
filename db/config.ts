import { createDataSource, createMigrationsConfig } from '@www/database';
import { entities } from '@www/common';
import { join } from 'path';

export const migrationsConfig = createMigrationsConfig(
  entities,
  join(__dirname, 'migrations', '*.ts'),
);

export const MigrationsDataSource = createDataSource(migrationsConfig);
