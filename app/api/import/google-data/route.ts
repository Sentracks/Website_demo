import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { readExternalTemperatureFeed } from '@/lib/googleSource';

export async function GET() {
  const db = await readDb();
  const feed = await readExternalTemperatureFeed();

  let importedCount = 0;

  for (const item of feed) {
    const shipment = db.shipments.find((entry) => entry.shipmentCode === item.shipmentCode);
    if (!shipment) continue;

    const exists = db.temperatureLogs.some(
      (log) => log.shipmentId === shipment.id && log.recordedAt === item.recordedAt && log.sensorId === item.sensorId
    );

    if (exists) continue;

    db.temperatureLogs.push({
      id: `log-${crypto.randomUUID()}`,
      shipmentId: shipment.id,
      recordedAt: item.recordedAt,
      temperature: item.temperature,
      sensorId: item.sensorId,
      locationText: item.locationText
    });
    importedCount += 1;
  }

  await writeDb(db);
  return NextResponse.json({ importedCount });
}
