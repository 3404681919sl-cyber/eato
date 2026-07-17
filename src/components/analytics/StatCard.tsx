import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}

export default function StatCard({ icon, label, value, color, bg }: StatCardProps) {
  return (
    <div className='rounded-2xl px-5 py-4 border border-border' style={{ backgroundColor: bg }}>
      <div className='flex items-center gap-2.5 mb-3'>
        <div className='w-9 h-9 rounded-xl flex items-center justify-center' style={{ backgroundColor: color + '20' }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <p className='text-xl font-bold' style={{ fontFamily: 'DM Mono, monospace', color }}>{value}</p>
      <p className='text-xs text-muted-foreground mt-0.5'>{label}</p>
    </div>
  );
}
