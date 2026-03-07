'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AnalyzeButton({ shipmentId }: { shipmentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onAnalyze = async () => {
    setLoading(true);
    await fetch(`/api/shipments/${shipmentId}/analyze`, { method: 'POST' });
    router.refresh();
    setLoading(false);
  };

  return (
    <button className="button" onClick={onAnalyze} disabled={loading}>
      {loading ? 'Analyzing...' : 'Run Analysis'}
    </button>
  );
}
