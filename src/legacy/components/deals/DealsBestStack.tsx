import React from 'react';
import type { Deal } from '../../types';

export default function DealsBestStack({ deals, saving, finalPrice }: { deals: Deal[]; bestStack: string; saving: number; finalPrice: number }) {
  return (
    <div className='rounded-2xl px-5 py-4 text-sm leading-relaxed border'
      style={{ backgroundColor: '#BF4E2A08', borderColor: '#BF4E2A20' }}>
      <div className='flex items-center gap-2 mb-2'>
        <div className='w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold'
          style={{ backgroundColor: '#BF4E2A' }}>
          荐
        </div>
        <span className='font-bold text-foreground'>最优购买方案</span>
      </div>
      <p className='text-muted-foreground'>{deals.length > 0 ? `推荐搭配平台优惠，最高可节省 ¥${saving}` : '暂无最优方案'}</p>
      <div className='flex items-center gap-4 mt-3 pt-3 border-t border-border/40'>
        <div>
          <p className='text-xs text-muted-foreground'>原价</p>
          <p className='text-lg font-bold text-muted-foreground line-through' style={{ fontFamily: 'DM Mono, monospace' }}>
            ¥{deals[0]?.originalPrice || 0}
          </p>
        </div>
        <div className='text-2xl text-muted-foreground'>→</div>
        <div>
          <p className='text-xs text-muted-foreground'>最优到手价</p>
          <p className='text-2xl font-bold' style={{ color: '#BF4E2A', fontFamily: 'DM Mono, monospace' }}>
            ¥{finalPrice}
          </p>
        </div>
        <div className='flex-1' />
        <div className='text-right'>
          <p className='text-xs text-muted-foreground'>节省</p>
          <p className='text-lg font-bold' style={{ color: '#16A34A', fontFamily: 'DM Mono, monospace' }}>
            -¥{saving}
          </p>
        </div>
      </div>
    </div>
  );
}
