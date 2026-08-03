import fs from 'node:fs';
import path from 'node:path';

export function readStyles(root = process.cwd()) {
  return [
    'app/styles/tokens.css',
    'app/styles/reset.css',
    'app/styles/legacy-geometry.css',
    'app/styles/components.css',
  ].map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
}
