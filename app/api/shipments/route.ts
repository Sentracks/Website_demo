import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { analyzeShipment } from '@/lib/analysis';

export async function GET(request: NextRequest) {
  const db = await readDb();
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const carrierId = searchParams.get('carrierId');

  const shipments = db.shipments.filter((shipment) => {
    if (status && shipment.status !== status) return false;
    if (carrierId && shipment.carrierId !== carrierId) return false;
    return true;
  }).map((shipment) => {
    const logs = db.temperatureLogs.filter((log) => log.shipmentId === shipment.id);
    const analysis = db.shipmentAnalyses.find((item) => item.shipmentId === shipment.id) ?? analyzeShipment(shipment, logs);
    return { ...shipment, analysis };
  });

  return NextResponse.json(shipments);
}
