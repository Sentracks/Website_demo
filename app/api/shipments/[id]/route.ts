import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { analyzeShipment } from '@/lib/analysis';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const shipment = db.shipments.find((item) => item.id === id);

  if (!shipment) {
    return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
  }

  const logs = db.temperatureLogs.filter((log) => log.shipmentId === shipment.id);
  const analysis = db.shipmentAnalyses.find((item) => item.shipmentId === shipment.id) ?? analyzeShipment(shipment, logs);

  return NextResponse.json({ shipment, logs, analysis });
}
