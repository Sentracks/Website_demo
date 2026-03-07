import Link from 'next/link';
import { readDb } from '@/lib/db';
import { analyzeShipment, buildCarrierScore } from '@/lib/analysis';
import { StatCard } from '@/components/StatCard';
import { ImportButton } from '@/components/ImportButton';

export default async function DashboardPage() {
  const db = await readDb();

  const analyses = db.shipments.map((shipment) => {
    const cached = db.shipmentAnalyses.find((item) => item.shipmentId === shipment.id);
    if (cached) return cached;
    const logs = db.temperatureLogs.filter((log) => log.shipmentId === shipment.id);
    return analyzeShipment(shipment, logs);
  });

  const carrierScores = db.carriers.map((carrier) => buildCarrierScore(carrier.id, db.shipments, analyses));
  const flaggedCount = analyses.filter((item) => item.riskLevel === 'high').length;
  const avgScore = analyses.length ? Math.round(analyses.reduce((sum, item) => sum + item.overallScore, 0) / analyses.length) : 0;
  const avgExcursionMinutes = analyses.length
    ? Math.round(analyses.reduce((sum, item) => sum + item.totalExcursionMinutes, 0) / analyses.length)
    : 0;

  return (
    <div className="grid" style={{ gap: 24 }}>
      <div className="header-row">
        <div>
          <h1 style={{ marginBottom: 8 }}>Cold Chain Dashboard</h1>
          <div className="muted">Import sensor data, analyze shipment quality, and compare carriers.</div>
        </div>
        <ImportButton />
      </div>

      <div className="grid grid-4">
        <StatCard title="Total Shipments" value={db.shipments.length} />
        <StatCard title="High-Risk Shipments" value={flaggedCount} />
        <StatCard title="Average Quality Score" value={`${avgScore}/100`} />
        <StatCard title="Avg Excursion Minutes" value={avgExcursionMinutes} />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="header-row">
            <h2 className="section-title">Recent Shipments</h2>
            <Link href="/shipments" className="small muted">View all</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Carrier</th>
                  <th>Status</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {db.shipments.map((shipment) => {
                  const carrier = db.carriers.find((item) => item.id === shipment.carrierId);
                  const analysis = analyses.find((item) => item.shipmentId === shipment.id);
                  return (
                    <tr key={shipment.id}>
                      <td><Link href={`/shipments/${shipment.id}`}>{shipment.shipmentCode}</Link></td>
                      <td>{carrier?.name}</td>
                      <td>{shipment.status}</td>
                      <td>{analysis?.overallScore ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="header-row">
            <h2 className="section-title">Carrier Ranking</h2>
            <Link href="/carriers" className="small muted">View all</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Carrier</th>
                  <th>Compliance</th>
                  <th>Avg Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {carrierScores.sort((a, b) => b.averageScore - a.averageScore).map((score) => {
                  const carrier = db.carriers.find((item) => item.id === score.carrierId);
                  return (
                    <tr key={score.carrierId}>
                      <td>{carrier?.name}</td>
                      <td>{score.complianceRate}%</td>
                      <td>{score.averageScore}</td>
                      <td>{score.grade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
