'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { format } from 'date-fns';

export function TemperatureChart({
  points,
  min,
  max
}: {
  points: { recordedAt: string; temperature: number }[];
  min: number;
  max: number;
}) {
  const data = points.map((item) => ({
    time: format(new Date(item.recordedAt), 'MM-dd HH:mm'),
    temperature: item.temperature
  }));

  return (
    <div style={{ width: '100%', height: 360 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <ReferenceLine y={min} label="Min" />
          <ReferenceLine y={max} label="Max" />
          <Line type="monotone" dataKey="temperature" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
