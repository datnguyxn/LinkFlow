'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: 'Mon', clicks: 120 },
  { date: 'Tue', clicks: 240 },
  { date: 'Wed', clicks: 180 },
  { date: 'Thu', clicks: 320 },
  { date: 'Fri', clicks: 280 },
  { date: 'Sat', clicks: 410 },
  { date: 'Sun', clicks: 360 },
];

export default function ClicksOverview() {
  return (
    <div
      className="
        mt-5
        rounded-2xl
        border
        bg-white
        p-6
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Clicks Overview</h2>

        <p className="text-sm text-slate-500">Click performance over the last 7 days</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="clicks"
              stroke="currentColor"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
