import React from 'react';
import type { Place } from '../../types';
import { matchBrand, avatarText, avatarColor, isLightHex } from '../../utils/brandMatch';

export default function PlaceAvatar({ place, sizePx = 36 }: { place: Place; sizePx?: number }) {
  if (place.image) {
    return (
      <img src={place.image} alt='' width={sizePx} height={sizePx}
        className='rounded-xl object-cover flex-shrink-0'
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    );
  }
  const color = avatarColor(place.name);
  const text = avatarText(place.name);
  const txtColor = isLightHex(color) ? '#1A1A1A' : '#FFFFFF';
  return (
    <div style={{ width: sizePx, height: sizePx, backgroundColor: color, color: txtColor }}
      className='rounded-xl flex items-center justify-center font-semibold flex-shrink-0'
      aria-label={place.name}>
      {text}
    </div>
  );
}
