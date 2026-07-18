import React, { useState } from 'react';
import type { Place } from '../../types';
import { matchBrand, avatarText, avatarColor, isLightHex } from '../../utils/brandMatch';

export default function PlaceAvatar({ place, sizePx = 36 }: { place: Place; sizePx?: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = place.image && !imgFailed;

  if (showImage) {
    return (
      <img src={place.image} alt='' width={sizePx} height={sizePx}
        className='rounded-xl object-cover flex-shrink-0'
        onError={() => setImgFailed(true)} />
    );
  }

  // 无图 / 远程图加载失败 → 品牌色块（命中品牌库）或店名首字色块兜底
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
