import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MonthlyData {
  name: string;
  spent: number;
}

export default function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className='bg-card border border-border rounded-2xl px-6 py-5'>
      <h3 className='text-sm font-semibold text-foreground mb-1'>月度消费趋势</h3>
      <p className='text-xs text-muted-foreground mb-4'>近七个月总消费（元）</p>
      <ResponsiveContainer width='100%' height={200}>
        <BarChart data={data} barSize={18}>
          <XAxis dataKey='name' tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => '¥' + v} />
          <Tooltip contentStyle={{
            borderRadius: '12px', border: '1px solid rgba(150,100,50,0.16)', fontSize: '12px', backgroundColor: '#FFFCF6',
          }} />
          <Bar dataKey='spent' radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === data.length - 1 ? '#BF4E2A' : '#BF4E2A60'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
