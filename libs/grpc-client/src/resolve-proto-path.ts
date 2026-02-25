import * as path from 'path';
import * as fs from 'fs';

/**
 * Преобразует относительный путь к proto-файлу в абсолютный.
 * Ищет файл, поднимаясь от process.cwd() вверх (на случай когда cwd = apps/ или apps/api-gateway).
 */
export function resolveProtoPath(relativePath: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  let dir = process.cwd();
  const maxLevels = 6;
  for (let i = 0; i < maxLevels; i++) {
    const candidate = path.join(dir, relativePath);
    if (fs.existsSync(candidate)) {
      return path.resolve(candidate);
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(process.cwd(), relativePath);
}
