import Link from 'next/link';
import { readDb } from '@/lib/db';
import { analyzeShipment, buildCarrierScore } from '@/lib/analysis';

export default async function CarriersPage() {
  const db = await readDb();
  const analyses = db.shipments.map((shipment) => {
    return db.shipmentAnalyses.find((item) => item.shipmentId === shipment.id) ?? analyzeShipment(
      shipment,
      db.temperatureLogs.filter((log) => log.shipmentId === shipment.id)
    );
  });

  const scores = db.carriers.map((carrier) => buildCarrierScore(carrier.id, db.shipments, analyses));

  return (
    <div className="card">
      <h1 style={{ marginBottom: 8 }}>Carrier Quality Evaluation</h1>
      <div className="muted">Use compliance rate, excursion duration, and average score to rank transport partners.</div>
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Carrier</th>
              <th>Shipments</th>
              <th>Compliance Rate</th>
              <th>Avg Excursion Minutes</th>
              <th>Avg Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {scores.sort((a, b) => b.averageScore - a.averageScore).map((score) => {
              const carrier = db.carriers.find((item) => item.id === score.carrierId);
              const firstShipment = db.shipments.find((item) => item.carrierId === score.carrierId);
              return (
                <tr key={score.carrierId}>
                  <td>{firstShipment ? <Link href={`/shipments/${firstShipment.id}`}>{carrier?.name}</Link> : carrier?.name}</td>
                  <td>{score.shipmentCount}</td>
                  <td>{score.complianceRate}%</td>
                  <td>{score.averageExcursionMinutes}</td>
                  <td>{score.averageScore}</td>
                  <td>{score.grade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
