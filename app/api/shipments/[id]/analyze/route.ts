import { NextResponse } from 'next/server';
import { analyzeShipment, buildCarrierScore } from '@/lib/analysis';
import { readDb, writeDb } from '@/lib/db';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const shipment = db.shipments.find((item) => item.id === id);

  if (!shipment) {
    return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
  }

  const logs = db.temperatureLogs.filter((log) => log.shipmentId === shipment.id);
  const analysis = analyzeShipment(shipment, logs);
  db.shipmentAnalyses = db.shipmentAnalyses.filter((item) => item.shipmentId !== shipment.id);
  db.shipmentAnalyses.push(analysis);

  const carrierScore = buildCarrierScore(
    shipment.carrierId,
    db.shipments,
    db.shipmentAnalyses
  );
  db.carrierScores = db.carrierScores.filter((item) => item.carrierId !== shipment.carrierId);
  db.carrierScores.push(carrierScore);

  await writeDb(db);
  return NextResponse.json({ analysis, carrierScore });
}
