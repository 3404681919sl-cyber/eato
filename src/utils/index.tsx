import React, { useState, useRef, useEffect } from 'react';
import type { Mood, Category } from '../types';
import { MOOD, CAT } from '../constants';
import { Star, ChevronDown } from 'lucide-react';

export function StarRow({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
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

export function MoodPicker({ value, onChange, disabled }: { value: Mood; onChange: (m: Mood) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const m = MOOD[value];
  return (
    <div className='relative' ref={ref}>
      <button type='button' onClick={() => !disabled && setOpen((o) => !o)}
        className={'flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full transition-colors ' + (disabled ? 'cursor-default opacity-60' : 'cursor-pointer hover:opacity-80')}
        style={{ backgroundColor: m.color + '20', color: m.color }}>
        <span>{m.emoji}</span><span>{m.label}</span>
      </button>
      {open && (
        <div className='absolute top-7 left-0 z-30 bg-card border border-border rounded-xl p-1.5 shadow-xl flex flex-col gap-0.5 w-28'>
          {(Object.entries(MOOD) as [Mood, typeof MOOD[Mood]][]).map(([key, cfg]) => (
            <button key={key} type='button' onClick={() => { onChange(key); setOpen(false); }}
              className={'flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-colors ' + (value === key ? 'font-semibold' : 'text-muted-foreground hover:bg-secondary')}
              style={value === key ? { backgroundColor: cfg.color + '15', color: cfg.color } : {}}>
              <span>{cfg.emoji}</span><span>{cfg.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryPicker({ value, onChange, disabled }: { value: Category; onChange: (c: Category) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const cat = CAT[value];
  return (
    <div className='relative' ref={ref}>
      <button type='button' onClick={() => !disabled && setOpen((o) => !o)}
        className={'flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all ' + (disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-80')}
        style={{ backgroundColor: cat.light, color: cat.color, borderColor: cat.color + '40' }}>
        <span>{cat.emoji}</span><span>{cat.label}</span>
        {!disabled && <ChevronDown className='w-2.5 h-2.5 ml-0.5 opacity-60' />}
      </button>
      {open && (
        <div className='absolute top-7 left-0 z-30 bg-card border border-border rounded-xl p-1.5 shadow-xl grid grid-cols-2 gap-0.5 w-48'>
          {(Object.entries(CAT) as [Category, typeof CAT[Category]][]).map(([key, cfg]) => (
            <button key={key} type='button' onClick={() => { onChange(key); setOpen(false); }}
              className={'flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors ' + (value === key ? 'font-semibold' : 'text-muted-foreground hover:bg-secondary')}
              style={value === key ? { backgroundColor: cfg.light, color: cfg.color } : {}}>
              <span>{cfg.emoji}</span><span>{cfg.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}