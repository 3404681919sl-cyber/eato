import React from 'react';
import { Star } from 'lucide-react';
import { CAT } from '../../constants';
import type { Place, Category } from '../../types';
import PlaceAvatar from '../table/PlaceAvatar';

export default function TopRestaurants({ places }: { places: Place[] }) {
  const top = [...places].sort((a, b) => b.stars - a.stars).slice(0, 5);

  return (
    <div className='bg-card border border-border rounded-2xl px-6 py-5'>
      <h3 className='text-sm font-semibold text-foreground mb-1'>🏆 高分餐厅</h3>
      <p className='text-xs text-muted-foreground mb-4'>评分最高的收藏餐厅</p>
      <div className='space-y-3'>
        {top.map((p) => (
          <div key={p.id} className='flex items-center gap-3'>
            <PlaceAvatar place={p} sizePx={40} />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-foreground truncate'>{p.name}</p>
              <div className='flex items-center gap-2'>
                <div className='flex gap-0.5'>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={'w-2.5 h-2.5 ' + (s <= p.stars ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20')} />
                  ))}
                </div>
                <span className='text-xs text-muted-foreground'>{CAT[p.category as Category].emoji} {CAT[p.category as Category].label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
