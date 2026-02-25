import { resolve } from 'path';
import { showMigrations } from '../migration-runner';

const configPath = resolve(process.cwd(), process.argv[2] || 'db/config.ts');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mod = require(configPath);
showMigrations(mod.migrationsConfig);
