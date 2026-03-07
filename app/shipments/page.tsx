import Link from 'next/link';
import { readDb } from '@/lib/db';
import { analyzeShipment } from '@/lib/analysis';

export default async function ShipmentsPage() {
  const db = await readDb();

  return (
    <div className="card">
      <div className="header-row">
        <div>
          <h1 style={{ marginBottom: 8 }}>Shipments</h1>
          <div className="muted">Each record includes route, temperature control, and risk level.</div>
        </div>
      </div>

      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Shipment</th>
              <th>Carrier</th>
              <th>Route</th>
              <th>Temp Range</th>
              <th>Score</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {db.shipments.map((shipment) => {
              const carrier = db.carriers.find((item) => item.id === shipment.carrierId);
              const logs = db.temperatureLogs.filter((log) => log.shipmentId === shipment.id);
              const analysis = db.shipmentAnalyses.find((item) => item.shipmentId === shipment.id) ?? analyzeShipment(shipment, logs);
              const badgeClass = analysis.riskLevel === 'low' ? 'badge-good' : analysis.riskLevel === 'medium' ? 'badge-warn' : 'badge-bad';

              return (
                <tr key={shipment.id}>
                  <td><Link href={`/shipments/${shipment.id}`}>{shipment.shipmentCode}</Link></td>
                  <td>{carrier?.name}</td>
                  <td>{shipment.origin} → {shipment.destination}</td>
                  <td>{shipment.targetTempMin}°C to {shipment.targetTempMax}°C</td>
                  <td>{analysis.overallScore}</td>
                  <td><span className={`badge ${badgeClass}`}>{analysis.riskLevel}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
