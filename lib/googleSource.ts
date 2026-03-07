import { promises as fs } from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import { ExternalTemperatureFeedItem } from './types';

export async function readExternalTemperatureFeed(): Promise<ExternalTemperatureFeedItem[]> {
  const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
  const fileName = process.env.GOOGLE_CLOUD_TEMPERATURE_FILE || 'mock-temperature-feed.json';

  if (bucketName) {
    const storage = new Storage({ projectId: process.env.GOOGLE_CLOUD_PROJECT_ID });
    const [buffer] = await storage.bucket(bucketName).file(fileName).download();
    return JSON.parse(buffer.toString('utf-8')) as ExternalTemperatureFeedItem[];
  }

  const localPath = path.join(process.cwd(), 'data', fileName);
  const raw = await fs.readFile(localPath, 'utf-8');
  return JSON.parse(raw) as ExternalTemperatureFeedItem[];
}
