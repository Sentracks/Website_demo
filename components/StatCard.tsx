export function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="card">
      <div className="muted small">{title}</div>
      <div className="stat">{value}</div>
      {subtitle ? <div className="muted small">{subtitle}</div> : null}
    </div>
  );
}
