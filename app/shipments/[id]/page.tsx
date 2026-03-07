import { notFound } from 'next/navigation';
import { readDb } from '@/lib/db';
import { analyzeShipment } from '@/lib/analysis';
import { TemperatureChart } from '@/components/TemperatureChart';
import { AnalyzeButton } from '@/components/AnalyzeButton';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const shipment = db.shipments.find((item) => item.id === id);
  if (!shipment) notFound();

  const carrier = db.carriers.find((item) => item.id === shipment.carrierId);
  const logs = db.temperatureLogs
    .filter((log) => log.shipmentId === shipment.id)
    .sort((a, b) => +new Date(a.recordedAt) - +new Date(b.recordedAt));
  const analysis = db.shipmentAnalyses.find((item) => item.shipmentId === shipment.id) ?? analyzeShipment(shipment, logs);
  const badgeClass = analysis.riskLevel === 'low' ? 'badge-good' : analysis.riskLevel === 'medium' ? 'badge-warn' : 'badge-bad';

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="header-row">
        <div>
          <h1 style={{ marginBottom: 8 }}>{shipment.shipmentCode}</h1>
          <div className="muted">{shipment.origin} → {shipment.destination}</div>
        </div>
        <AnalyzeButton shipmentId={shipment.id} />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="section-title">Shipment Summary</h2>
          <div className="kv"><strong>Carrier</strong><div>{carrier?.name}</div></div>
          <div className="kv"><strong>Product</strong><div>{shipment.productType}</div></div>
          <div className="kv"><strong>Window</strong><div>{formatDateTime(shipment.startTime)} to {formatDateTime(shipment.endTime)}</div></div>
          <div className="kv"><strong>Target Range</strong><div>{shipment.targetTempMin}°C to {shipment.targetTempMax}°C</div></div>
          <div className="kv"><strong>Status</strong><div>{shipment.status}</div></div>
          <div className="kv"><strong>Records</strong><div>{logs.length} temperature points</div></div>
        </div>

        <div className="card">
          <h2 className="section-title">Analysis Summary</h2>
          <div style={{ marginBottom: 12 }}><span className={`badge ${badgeClass}`}>{analysis.riskLevel}</span></div>
          <div className="grid grid-3 compact-grid">
            <div className="metric-box">
              <div className="metric-label">Overall Score</div>
              <div className="metric-value">{analysis.overallScore}</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Average Temp</div>
              <div className="metric-value">{analysis.avgTemp}°C</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Std Dev</div>
              <div className="metric-value">{analysis.tempStdDev}°C</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Excursions</div>
              <div className="metric-value">{analysis.excursionCount}</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Excursion Minutes</div>
              <div className="metric-value">{analysis.totalExcursionMinutes}</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Longest Excursion</div>
              <div className="metric-value">{analysis.longestExcursionMinutes} min</div>
            </div>
          </div>
          <div className="analysis-note" style={{ marginTop: 16 }}>
            <strong>Assessment</strong>
            <div className="muted" style={{ marginTop: 6 }}>{analysis.summary}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="header-row" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 6 }}>Analysis</h2>
            <div className="muted">Whole-shipment temperature trend, range breaches, and raw readings.</div>
          </div>
        </div>

        <div className="analysis-layout">
          <div>
            <h3 className="subsection-title">Temperature Trend</h3>
            <TemperatureChart points={logs} min={shipment.targetTempMin} max={shipment.targetTempMax} />
          </div>

          <div className="analysis-side-panel">
            <h3 className="subsection-title">Control Snapshot</h3>
            <div className="kv small-kv"><strong>Allowed Range</strong><div>{shipment.targetTempMin}°C to {shipment.targetTempMax}°C</div></div>
            <div className="kv small-kv"><strong>Observed Range</strong><div>{analysis.minTemp}°C to {analysis.maxTemp}°C</div></div>
            <div className="kv small-kv"><strong>Compliance Score</strong><div>{analysis.complianceScore}/50</div></div>
            <div className="kv small-kv"><strong>Stability Score</strong><div>{analysis.stabilityScore}/20</div></div>
            <div className="kv small-kv"><strong>Recovery Score</strong><div>{analysis.recoveryScore}/15</div></div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3 className="subsection-title">Temperature Records</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Temperature</th>
                  <th>Status</th>
                  <th>Sensor</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const outOfRange = log.temperature < shipment.targetTempMin || log.temperature > shipment.targetTempMax;
                  return (
                    <tr key={log.id}>
                      <td>{formatDateTime(log.recordedAt)}</td>
                      <td>{log.temperature}°C</td>
                      <td>
                        <span className={`badge ${outOfRange ? 'badge-bad' : 'badge-good'}`}>
                          {outOfRange ? 'out of range' : 'in range'}
                        </span>
                      </td>
                      <td>{log.sensorId}</td>
                      <td>{log.locationText}</td>
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
