import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(__dirname, '../../../.env');
config({ path: envPath });

export interface DatabaseConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
  entities: any[];
  migrations?: string[];
  synchronize?: boolean;
  logging?: boolean;
}

export interface MigrationsConfigOptions {
  database?: string;
  synchronize?: boolean;
  logging?: boolean;
}

export function createMigrationsConfig(
  entities: any[],
  migrationsGlob: string,
  overrides?: MigrationsConfigOptions,
): DatabaseConfig {
  return {
    database: overrides?.database ?? process.env['DB_NAME'] ?? 'www',
    entities,
    migrations: [migrationsGlob],
    synchronize: overrides?.synchronize ?? false,
    logging: overrides?.logging ?? (process.env['DB_LOGGING'] === 'true'),
  };
}

export function createDataSource(config: DatabaseConfig): DataSource {
  const options: DataSourceOptions = {
    type: 'postgres',
    host: config.host || process.env['DB_HOST'] || 'localhost',
    port: config.port || parseInt(process.env['DB_PORT'] || '5432', 10),
    username: config.username || process.env['DB_USERNAME'] || 'postgres',
    password: config.password || process.env['DB_PASSWORD'] || 'postgres',
    database: config.database || process.env['DB_NAME'] || 'www',
    entities: config.entities,
    migrations: config.migrations || [],
    synchronize: config.synchronize ?? false,
    logging: config.logging ?? (process.env['DB_LOGGING'] === 'true'),
  };

  return new DataSource(options);
}
