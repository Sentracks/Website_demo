import { promises as fs } from 'fs';
import path from 'path';
import { DatabaseShape } from './types';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

export async function readDb(): Promise<DatabaseShape> {
  const raw = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(raw) as DatabaseShape;
}

export async function writeDb(data: DatabaseShape): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}
