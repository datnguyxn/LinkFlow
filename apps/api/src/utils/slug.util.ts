import slugify from 'slugify';
import { randomUUID } from 'crypto';

export function generateWorkspaceSlug(name: string) {
  return `${slugify(name, {
    lower: true,
    strict: true,
  })}-${randomUUID().slice(0, 8)}`;
}
