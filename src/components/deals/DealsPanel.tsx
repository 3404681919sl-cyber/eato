import React, { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import type { Category, DealsResult, DealStatus } from '../../types';
import { generateDeals, getPlatformDealUrl } from '../../data';
import DealsIdle from './DealsIdle';
import DealsLoading from './DealsLoading';
import DealCard from './DealCard';
import DealsBestStack from './DealsBestStack';

const CATEGORY_IMAGES: Record<string, string> = {
  hotpot: '/brands/category-hotpot.png',
  sushi: '/brands/category-sushi.png',
  noodles: '/brands/category-noodles.png',
  cafe: '/brands/category-cafe.png',
  western: '/brands/category-western.png',
  bbq: '/brands/category-bbq.png',
  local: '/brands/category-local.png',
  other: '/brands/category-other.png',
};

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
    } catch {}
    setResult(generateDeals(category));
    setStatus('done');
  };

  if (status === 'idle') return <DealsIdle onSearch={search} />;
  if (status === 'loading') return <DealsLoading />;
  if (!result) return null;

  const categoryImg = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.other;

  return (
    <div className='py-4 px-5'>
      <div className='flex items-center justify-between mb-4'>
        <h4 className='text-sm font-bold text-foreground'>共找到 {result.deals.length} 个平台优惠</h4>
        <span className='text-xs text-muted-foreground' style={{ fontFamily: 'DM Mono, monospace' }}>
          最高可省 ¥{result.saving}
        </span>
      </div>

      <div className='grid grid-cols-1 gap-3 mb-4'>
        {result.deals.map((deal) => (
          <DealCard
            key={deal.platform}
            deal={deal}
            category={category}
            categoryImg={categoryImg}
            dealUrl={getPlatformDealUrl(deal.platform, placeName, category)}
          />
        ))}
      </div>

      <DealsBestStack deals={result.deals} bestStack={result.bestStack} saving={result.saving} finalPrice={result.finalPrice} />

      <button onClick={onClose}
        className='w-full mt-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-1.5'>
        <ChevronUp className='w-4 h-4' />
        收起比价
      </button>
    </div>
  );
}
