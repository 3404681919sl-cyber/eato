import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PieData {
  name: string;
  value: number;
  color: string;
  emoji: string;
}

export default function CategoryPieChart({ data }: { data: PieData[] }) {
  if (data.length === 0) {
    return (
      <div className='bg-card border border-border rounded-2xl px-6 py-5'>
        <h3 className='text-sm font-semibold text-foreground mb-1'>品类分布</h3>
        <p className='text-xs text-muted-foreground mb-4'>按餐厅类别统计打卡次数</p>
        <p className='text-sm text-muted-foreground py-6 text-center'>还没有打卡记录，开始记录美食之旅吧！</p>
      </div>
    );
  }

  return (
    <div className='bg-card border border-border rounded-2xl px-6 py-5'>
      <h3 className='text-sm font-semibold text-foreground mb-1'>品类分布</h3>
      <p className='text-xs text-muted-foreground mb-4'>按餐厅类别统计打卡次数</p>
      <div className='flex items-center gap-4'>
        <ResponsiveContainer width='60%' height={200}>
          <PieChart>
            <Pie data={data} cx='50%' cy='50%' innerRadius={58} outerRadius={90} paddingAngle={3} dataKey='value'>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{
              borderRadius: '12px', border: '1px solid rgba(150,100,50,0.16)', fontSize: '12px', backgroundColor: '#FFFCF6',
            }} />
          </PieChart>
        </ResponsiveContainer>
        <div className='flex flex-col gap-2.5'>
          {data.map((item) => (
            <div key={item.name} className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
              <span className='text-muted-foreground'>{item.emoji} {item.name}</span>
              <span className='font-semibold text-foreground' style={{ fontFamily: 'DM Mono, monospace' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
