import React from 'react';
import { USERS } from '../../constants';

interface IntervalDef {
  label: string;
  start: string;
  end: string;
  color: string;
  icon: string;
}

export default function CalendarHeader({
  currentUser, onUserChange,
  interval, intervals, onIntervalChange,
}: {
  currentUser: string;
  onUserChange: (id: string) => void;
  interval: string;
  intervals: IntervalDef[];
  onIntervalChange: (label: string) => void;
}) {
  const cu = USERS.find((u) => u.id === currentUser)!;

  return (
    <div className='flex items-center justify-between mb-6'>
      <div className='flex items-center gap-3'>
        <h2 className='text-lg font-bold text-foreground' style={{ fontFamily: 'Playfair Display, serif' }}>约饭日历</h2>
        <div className='flex gap-1.5'>
          {USERS.map((u) => (
            <button key={u.id} type='button' onClick={() => onUserChange(u.id)}
              className='w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold transition-all'
              style={{
                backgroundColor: u.color,
                opacity: currentUser === u.id ? 1 : 0.5,
                boxShadow: currentUser === u.id ? '0 0 0 2px ' + u.color + '40' : 'none',
              }}
              title={u.name}>
              {u.name[0]}
            </button>
          ))}
        </div>
        <span className='text-xs text-muted-foreground ml-2'>
          点击格子标记 <strong style={{ color: cu.color }}>{cu.name}</strong>的空闲时间
        </span>
      </div>
      <div className='flex gap-1 bg-card border border-border rounded-xl p-1'>
        {intervals.map((iv) => (
          <button key={iv.label} type='button' onClick={() => onIntervalChange(iv.label)}
            className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (interval === iv.label ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            style={interval === iv.label ? { backgroundColor: iv.color + '15', color: iv.color } : {}}>
            {iv.icon} {iv.label}
          </button>
        ))}
      </div>
    </div>
  );
}
