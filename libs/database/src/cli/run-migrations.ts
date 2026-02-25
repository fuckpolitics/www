import { resolve } from 'path';
import { runMigrations } from '../migration-runner';

const configPath = resolve(process.cwd(), process.argv[2] || 'db/config.ts');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mod = require(configPath);
runMigrations(mod.migrationsConfig);
