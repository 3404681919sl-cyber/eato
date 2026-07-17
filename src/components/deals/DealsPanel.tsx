import React, { useState } from 'react';
import { Zap, Loader2, ChevronDown, ExternalLink } from 'lucide-react';
import type { Category, DealsResult, DealStatus } from '../../types';
import { PLATFORMS } from '../../constants';
import { generateDeals, getPlatformDealUrl } from '../../data';

export default function DealsPanel({ placeName, category, onClose }: { placeName: string; category: Category; onClose: () => void }) {
  const [status, setStatus] = useState<DealStatus>('idle');
  const [result, setResult] = useState<DealsResult | null>(null);

  const search = async () => {
    setStatus('loading');
    try {
      const resp = await fetch('/api/deals?place=' + encodeURIComponent(placeName) + '&category=' + category);
      if (resp.ok) {
        const data = await resp.json();
        setResult(data);
        setStatus('done');
        return;
      }
    } catch {
      // fallback
    }
    setResult(generateDeals(category));
    setStatus('done');
  };

  if (status === 'idle') {
    return (
      <div className='flex items-center justify-between py-3 px-4'>
        <p className='text-xs text-muted-foreground'>点击自动检索各平台最新优惠，AI 为你比对最优组合</p>
        <button onClick={search}
          className='flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90'
          style={{ backgroundColor: '#BF4E2A', color: 'white' }}>
          <Zap className='w-3 h-3' />
          开始查询
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className='py-6 flex flex-col items-center gap-3'>
        <div className='flex items-center gap-3'>
          <Loader2 className='w-4 h-4 text-primary animate-spin' />
          <span className='text-xs text-muted-foreground'>正在检索美团、抖音、大众点评、淘宝闪购、闲鱼...</span>
        </div>
        <div className='flex gap-2'>
          {Object.values(PLATFORMS).map((p, i) => (
            <div key={p.name} className='text-xs px-2 py-1 rounded-full font-medium animate-pulse'
              style={{ backgroundColor: p.bg, color: p.textColor, animationDelay: (i * 0.15) + 's' }}>
              {p.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className='py-4 px-4'>
      <div className='grid grid-cols-1 gap-2 mb-4'>
        {result.deals.map((deal) => {
          const p = PLATFORMS[deal.platform];
          const dealUrl = getPlatformDealUrl(deal.platform, placeName, category);
          return (
            <div key={deal.platform}
              className={'flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-all ' + (deal.isBest ? 'ring-1' : '')}
              style={{
                backgroundColor: deal.isBest ? p.bg : 'rgba(242,233,213,0.25)',
                borderColor: deal.isBest ? p.color + '60' : 'rgba(150,100,50,0.12)',
                boxShadow: deal.isBest ? '0 0 0 1px ' + p.color + '40' : undefined,
              }}>
              <div className='flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold min-w-[68px] text-center'
                style={{ backgroundColor: p.color + '22', color: p.textColor, border: '1px solid ' + p.color + '40' }}>
                {p.name}
              </div>
              <p className='text-xs text-muted-foreground flex-1 truncate'>{deal.description}</p>
              {deal.tag && (
                <span className='text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0'
                  style={{ backgroundColor: deal.isBest ? '#BF4E2A' : '#E8963C', color: 'white' }}>
                  {deal.tag}
                </span>
              )}
              <div className='flex items-baseline gap-1 flex-shrink-0'>
                <span className='text-base font-bold' style={{ color: deal.isBest ? '#BF4E2A' : '#2C1810', fontFamily: 'DM Mono, monospace' }}>
                  ¥{deal.price}
                </span>
                <span className='text-[11px] text-muted-foreground line-through' style={{ fontFamily: 'DM Mono, monospace' }}>
                  ¥{deal.originalPrice}
                </span>
              </div>
              <a href={dealUrl} target='_blank' rel='noopener noreferrer'
                className='flex-shrink-0 text-xs font-medium px-2 py-1 rounded-lg hover:opacity-80 flex items-center gap-1'
                style={{ backgroundColor: p.color + '18', color: p.textColor }}>
                去看看 <ExternalLink className='w-3 h-3' />
              </a>
            </div>
          );
        })}
      </div>
      <div className='rounded-xl px-4 py-3 text-xs leading-relaxed'
        style={{ backgroundColor: '#BF4E2A0D', border: '1px solid #BF4E2A20' }}>
        <span className='font-semibold' style={{ color: '#BF4E2A' }}>💡 最优组合：</span>
        {result.bestStack}
        <span className='block mt-1 text-muted-foreground'>
          共节省 <strong style={{ color: '#BF4E2A' }}>¥{result.saving}</strong>，到手约 ¥{result.finalPrice}
        </span>
      </div>
      <button onClick={onClose} className='text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mt-3'>
        <ChevronDown className='w-3 h-3' /> 收起
      </button>
    </div>
  );
}
