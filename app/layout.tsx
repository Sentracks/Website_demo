import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cold Chain Monitor',
  description: 'Track temperature excursions, analyze shipments, and rate carriers.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <div className="nav">
            <Link href="/">Dashboard</Link>
            <Link href="/shipments">Shipments</Link>
            <Link href="/carriers">Carriers</Link>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
