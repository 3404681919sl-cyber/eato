import React from 'react';
import { ExternalLink, Star, ShoppingCart } from 'lucide-react';
import type { Deal } from '../../types';
import { PLATFORMS } from '../../constants';

const CATEGORY_IMAGES: Record<string, string> = {
  hotpot: '/brands/category-hotpot.svg',
  sushi: '/brands/category-sushi.svg',
  noodles: '/brands/category-noodles.svg',
  cafe: '/brands/category-cafe.svg',
  western: '/brands/category-western.svg',
  bbq: '/brands/category-bbq.svg',
  local: '/brands/category-local.svg',
  other: '/brands/category-other.svg',
};

interface DealCardProps {
  deal: Deal;
  category: string;
  categoryImg: string;
  dealUrl: string;
}

export default function DealCard({ deal, category, categoryImg, dealUrl }: DealCardProps) {
  const p = PLATFORMS[deal.platform];
  const disc = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
  const soldCount = Math.floor(Math.random() * 800) + 200;
  const rating = (4 + Math.random()).toFixed(1);

  return (
    <div className={'rounded-2xl border-2 overflow-hidden transition-all hover:shadow-md ' + (deal.isBest ? 'ring-2' : '')}
      style={{
        borderColor: deal.isBest ? p.color : 'rgba(150,100,50,0.12)',
        backgroundColor: '#FFFFFF',
      }}>
      <div className='flex gap-4 p-3'>
        <div className='w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50'>
          <img src={categoryImg || CATEGORY_IMAGES[category] || CATEGORY_IMAGES.other} alt=''
            className='w-full h-full object-cover'
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className='flex-1 min-w-0'>
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
          <p className='text-sm font-semibold text-foreground mb-1 line-clamp-1'>{deal.description}</p>
          <div className='flex items-center gap-3 text-xs text-muted-foreground mb-2'>
            <span className='flex items-center gap-1'>
              <Star className='w-3 h-3 fill-amber-400 text-amber-400' /> {rating}
            </span>
            <span className='flex items-center gap-1'>
              已售 {soldCount}+
            </span>
          </div>
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
      <a href={dealUrl} target='_blank' rel='noopener noreferrer'
        className='flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all hover:opacity-90'
        style={{ backgroundColor: deal.isBest ? p.color : p.color + '15', color: deal.isBest ? '#fff' : p.textColor }}>
        <ShoppingCart className='w-4 h-4' />
        去 {p.name} 购买
        <ExternalLink className='w-3.5 h-3.5' />
      </a>
    </div>
  );
}

