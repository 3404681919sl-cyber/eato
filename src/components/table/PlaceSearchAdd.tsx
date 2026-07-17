import React from 'react';
import { Search, Plus } from 'lucide-react';

export default function PlaceSearchAdd({ value, onChange, onAdd }: { value: string; onChange: (v: string) => void; onAdd: () => void }) {
  return (
    <div className='flex items-center gap-3'>
      <div className='flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5'>
        <Search className='w-4 h-4 text-muted-foreground' />
        <input value={value} onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onAdd(); }}
          placeholder='搜索或添加餐厅...'
          className='flex-1 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/50' />
      </div>
      <button onClick={onAdd}
        className='px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5'>
        <Plus className='w-4 h-4' /> 添加
      </button>
    </div>
  );
}
