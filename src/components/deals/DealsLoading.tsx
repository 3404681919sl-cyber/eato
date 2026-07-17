import React from 'react';
import { Loader2 } from 'lucide-react';
import { PLATFORMS } from '../../constants';

export default function DealsLoading() {
  return (
    <div className='py-8 flex flex-col items-center gap-4'>
      <div className='flex items-center gap-3'>
        <Loader2 className='w-5 h-5 text-primary animate-spin' />
        <span className='text-sm text-muted-foreground'>正在检索各平台优惠...</span>
      </div>
      <div className='flex gap-2 flex-wrap justify-center'>
        {Object.values(PLATFORMS).map((p, i) => (
          <div key={p.name} className='text-xs px-3 py-1.5 rounded-full font-medium animate-pulse shadow-sm'
            style={{ backgroundColor: p.bg, color: p.textColor, animationDelay: (i * 0.15) + 's' }}>
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}
