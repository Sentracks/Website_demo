import { NextResponse } from 'next/server';
import { analyzeShipment, buildCarrierScore } from '@/lib/analysis';
import { readDb } from '@/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const carrier = db.carriers.find((item) => item.id === id);

  if (!carrier) {
    return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
  }

  const analyses = db.shipments.map((shipment) => {
    return db.shipmentAnalyses.find((item) => item.shipmentId === shipment.id) ?? analyzeShipment(
      shipment,
      db.temperatureLogs.filter((log) => log.shipmentId === shipment.id)
    );
  });

  const score = db.carrierScores.find((item) => item.carrierId === id) ?? buildCarrierScore(id, db.shipments, analyses);
  return NextResponse.json({ carrier, score });
}
