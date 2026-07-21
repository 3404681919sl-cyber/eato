import React from 'react';
import { Star } from 'lucide-react';

export default function StarRow({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className='flex gap-0.5'>
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type='button' onClick={() => !disabled && onChange(s)} className={disabled ? 'cursor-default' : 'cursor-pointer'}>
          <Star className={'w-3 h-3 transition-colors ' + (s <= value ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30')} />
        </button>
      ))}
    </div>
  );
}
