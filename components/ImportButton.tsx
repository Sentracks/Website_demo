'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ImportButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const onImport = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/import/google-data');
      const data = await response.json();
      setMessage(`Imported ${data.importedCount} records.`);
      router.refresh();
    } catch {
      setMessage('Import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="button" onClick={onImport} disabled={loading}>
        {loading ? 'Importing...' : 'Import Google Cloud Data'}
      </button>
      {message ? <div className="small muted" style={{ marginTop: 8 }}>{message}</div> : null}
    </div>
  );
}
