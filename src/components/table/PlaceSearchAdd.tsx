import React, { useEffect, useRef, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { searchPOI, type PoiSuggestion } from '../../services/poiService';

type AddPayload = { name: string; image?: string };

export default function PlaceSearchAdd({
  value,
  onChange,
  onAdd,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: (payload?: AddPayload) => void;
}) {
  const [suggestions, setSuggestions] = useState<PoiSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // 输入防抖：停 300ms 才查 POI，避免每次按键都打后端
  useEffect(() => {
    const kw = value.trim();
    if (kw.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchPOI(kw);
      setSuggestions(res);
      setOpen(res.length > 0);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const pick = (s: PoiSuggestion) => {
    onChange(s.name);
    setOpen(false);
    setSuggestions([]);
    onAdd({ name: s.name, image: s.photo || undefined });
  };

  const submitPlain = () => {
    setOpen(false);
    onAdd(); // 不传 payload：用当前 value 创建，无图（走品牌库/首字兜底）
  };

  return (
    <div className='relative' ref={boxRef}>
      <div className='flex items-center gap-3'>
        <div className='flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5'>
          <Search className='w-4 h-4 text-muted-foreground' />
          <input value={value} onChange={(e) => onChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitPlain(); }}
            placeholder='搜索或添加餐厅...'
            className='flex-1 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/50' />
          {loading && <span className='text-xs text-muted-foreground'>…</span>}
        </div>
        <button onClick={submitPlain}
          className='px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5'>
          <Plus className='w-4 h-4' /> 添加
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <div className='absolute z-20 mt-2 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden'>
          {suggestions.map((s) => (
            <button key={s.id} type='button'
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              className='w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors'>
              {s.photo ? (
                <img src={s.photo} alt='' className='w-9 h-9 rounded-lg object-cover flex-shrink-0' />
              ) : (
                <div className='w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0'>
                  {s.name.slice(0, 1)}
                </div>
              )}
              <div className='min-w-0'>
                <div className='text-sm font-medium text-foreground truncate'>{s.name}</div>
                {s.address && <div className='text-xs text-muted-foreground truncate'>{s.address}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
