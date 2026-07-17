import React from 'react';
import { USERS } from '../../constants';

interface PairData {
  pair: string[];
  count: number;
  color: string;
}

export default function BestDiningPairs({ pairs }: { pairs: PairData[] }) {
  return (
    <div className='bg-card border border-border rounded-2xl px-6 py-5'>
      <h3 className='text-sm font-semibold text-foreground mb-1'>👬 约饭搭档</h3>
      <p className='text-xs text-muted-foreground mb-4'>一起吃饭最多的组合</p>
      <div className='space-y-3'>
        {pairs.map(({ pair, count, color }) => (
          <div key={pair.join('-')} className='flex items-center gap-3 rounded-2xl px-5 py-4 border border-border'
            style={{ backgroundColor: color + '08' }}>
            <div className='flex -space-x-2'>
              {pair.map((name, i) => {
                const u = USERS.find((x) => x.name === name);
                return (
                  <div key={i} className='w-9 h-9 rounded-full border-2 border-card flex items-center justify-center text-white text-xs font-bold shadow-sm'
                    style={{ backgroundColor: u?.color ?? color }}>
                    {name[0]}
                  </div>
                );
              })}
            </div>
            <div>
              <p className='text-sm font-semibold text-foreground'>{pair.join(' & ')}</p>
              <p className='text-xs text-muted-foreground' style={{ fontFamily: 'DM Mono, monospace' }}>{count} 次约饭</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
