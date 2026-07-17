import React from 'react';
import { Tag, Zap } from 'lucide-react';

export default function DealsIdle({ onSearch }: { onSearch: () => void }) {
  return (
    <div className='flex items-center justify-between py-4 px-5'>
      <div className='flex items-center gap-2.5'>
        <div className='w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center'>
          <Tag className='w-4 h-4 text-amber-700' />
        </div>
        <div>
          <p className='text-sm font-semibold text-foreground'>各平台优惠比价</p>
          <p className='text-xs text-muted-foreground'>一键对比美团、抖音、大众点评等平台最新优惠</p>
        </div>
      </div>
      <button onClick={onSearch}
        className='flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95 shadow-sm'
        style={{ backgroundColor: '#BF4E2A', color: 'white' }}>
        <Zap className='w-4 h-4' />
        开始比价
      </button>
    </div>
  );
}
