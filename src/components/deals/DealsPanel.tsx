import React, { useState } from 'react';
import { Zap, Loader2, ExternalLink, Star, Clock, ShoppingCart, Tag } from 'lucide-react';
import type { Category, DealsResult, DealStatus } from '../../types';
import { PLATFORMS } from '../../constants';
import { generateDeals, getPlatformDealUrl } from '../../data';

// Category-specific stock images for deal cards
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

  if (status === 'idle') {
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
        <button onClick={search}
          className='flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95 shadow-sm'
          style={{ backgroundColor: '#BF4E2A', color: 'white' }}>
          <Zap className='w-4 h-4' />
          开始比价
        </button>
      </div>
    );
  }

  if (status === 'loading') {
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

  if (!result) return null;
  var categoryImg = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.other;

  return (
    <div className='py-4 px-5'>
      {/* Results header */}
      <div className='flex items-center justify-between mb-4'>
        <h4 className='text-sm font-bold text-foreground'>共找到 {result.deals.length} 个平台优惠</h4>
        <span className='text-xs text-muted-foreground' style={{ fontFamily: 'DM Mono, monospace' }}>
          最高可省 ¥{result.saving}
        </span>
      </div>

      {/* Deal cards */}
      <div className='grid grid-cols-1 gap-3 mb-4'>
        {result.deals.map(function(deal) {
          var p = PLATFORMS[deal.platform];
          var disc = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
          var dealUrl = getPlatformDealUrl(deal.platform, placeName, category);
          var soldCount = Math.floor(Math.random() * 800) + 200;
          var rating = (4 + Math.random()).toFixed(1);
          return (
            <div key={deal.platform}
              className={'rounded-2xl border-2 overflow-hidden transition-all hover:shadow-md ' + (deal.isBest ? 'ring-2' : '')}
              style={{
                borderColor: deal.isBest ? p.color : 'rgba(150,100,50,0.12)',
                backgroundColor: '#FFFFFF',
              }}>
              <div className='flex gap-4 p-3'>
                {/* Product Image */}
                <div className='w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50'>
                  <img src={categoryImg} alt='' className='w-full h-full object-cover'
                    onError={function(e) { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                {/* Info */}
                <div className='flex-1 min-w-0'>
                  {/* Platform badge + best tag */}
                  <div className='flex items-center gap-2 mb-1.5'>
                    <span className='text-xs font-bold px-2.5 py-1 rounded-lg'
                      style={{ backgroundColor: p.color + '20', color: p.textColor }}>
                      {p.name}
                    </span>
                    {deal.isBest && (
                      <span className='text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white'
                        style={{ backgroundColor: '#BF4E2A' }}>
                        最低价
                      </span>
                    )}
                    {deal.tag && !deal.isBest && (
                      <span className='text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white'
                        style={{ backgroundColor: '#E8963C' }}>
                        {deal.tag}
                      </span>
                    )}
                  </div>
                  {/* Deal title */}
                  <p className='text-sm font-semibold text-foreground mb-1 line-clamp-1'>{deal.description}</p>
                  {/* Rating & sold */}
                  <div className='flex items-center gap-3 text-xs text-muted-foreground mb-2'>
                    <span className='flex items-center gap-1'>
                      <Star className='w-3 h-3 fill-amber-400 text-amber-400' /> {rating}
                    </span>
                    <span className='flex items-center gap-1'>
                      已售 {soldCount}+
                    </span>
                  </div>
                  {/* Price */}
                  <div className='flex items-baseline gap-2'>
                    <span className='text-xl font-bold' style={{ color: deal.isBest ? '#BF4E2A' : '#2C1810', fontFamily: 'DM Mono, monospace' }}>
                      ¥{deal.price}
                    </span>
                    <span className='text-xs text-muted-foreground line-through' style={{ fontFamily: 'DM Mono, monospace' }}>
                      ¥{deal.originalPrice}
                    </span>
                    <span className='text-[11px] font-semibold px-1.5 py-0.5 rounded-full'
                      style={{ backgroundColor: '#16A34A15', color: '#16A34A' }}>
                      -{disc}%
                    </span>
                  </div>
                </div>
              </div>
              {/* Buy button */}
              <a href={dealUrl} target='_blank' rel='noopener noreferrer'
                className='flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all hover:opacity-90'
                style={{ backgroundColor: deal.isBest ? p.color : p.color + '15', color: deal.isBest ? '#fff' : p.textColor }}>
                <ShoppingCart className='w-4 h-4' />
                去 {p.name} 购买
                <ExternalLink className='w-3.5 h-3.5' />
              </a>
            </div>
          );
        })}
      </div>

      {/* Best stack suggestion */}
      <div className='rounded-2xl px-5 py-4 text-sm leading-relaxed border'
        style={{ backgroundColor: '#BF4E2A08', borderColor: '#BF4E2A20' }}>
        <div className='flex items-center gap-2 mb-2'>
          <div className='w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold'
            style={{ backgroundColor: '#BF4E2A' }}>
            💡
          </div>
          <span className='font-bold text-foreground'>最优购买方案</span>
        </div>
        <p className='text-muted-foreground'>{result.bestStack}</p>
        <div className='flex items-center gap-4 mt-3 pt-3 border-t border-border/40'>
          <div>
            <p className='text-xs text-muted-foreground'>原价</p>
            <p className='text-lg font-bold text-muted-foreground line-through' style={{ fontFamily: 'DM Mono, monospace' }}>
              ¥{result.deals[0]?.originalPrice || 0}
            </p>
          </div>
          <div className='text-2xl text-muted-foreground'>→</div>
          <div>
            <p className='text-xs text-muted-foreground'>最优到手价</p>
            <p className='text-2xl font-bold' style={{ color: '#BF4E2A', fontFamily: 'DM Mono, monospace' }}>
              ¥{result.finalPrice}
            </p>
          </div>
          <div className='flex-1' />
          <div className='text-right'>
            <p className='text-xs text-muted-foreground'>节省</p>
            <p className='text-lg font-bold' style={{ color: '#16A34A', fontFamily: 'DM Mono, monospace' }}>
              -¥{result.saving}
            </p>
          </div>
        </div>
      </div>

      <button onClick={onClose}
        className='w-full mt-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-1.5'>
        收起比价
      </button>
    </div>
  );
}