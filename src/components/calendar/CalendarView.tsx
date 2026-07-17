import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { DAYS, HOURS, USERS } from '../../constants';

export default function CalendarView({ slots, setSlots }: {
  slots: Record<string, string[]>;
  setSlots: (s: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void;
}) {
  const [currentUser, setCurrentUser] = useState('a');

  const toggle = (day: string, time: string) => {
    const key = day + '_' + time;
    setSlots((prev) => {
      const cur = prev[key] || [];
      if (cur.includes(currentUser)) {
        return { ...prev, [key]: cur.filter((u) => u !== currentUser) };
      }
      return { ...prev, [key]: [...cur, currentUser] };
    });
  };

  const intervals = [
    { label: '午餐', start: '11:00', end: '14:00', color: '#BF4E2A', icon: '☀️' },
    { label: '下午茶', start: '14:00', end: '17:00', color: '#D97706', icon: '🍵' },
    { label: '晚餐', start: '17:00', end: '21:30', color: '#2563EB', icon: '🌙' },
  ];
  const [interval, setInterval] = useState('晚餐');

  const filteredSlots = intervals.find((iv) => iv.label === interval)!;
  const timeSlots = HOURS.filter((t) => {
    const [h, m] = t.split(':').map(Number);
    const [sh, sm] = filteredSlots.start.split(':').map(Number);
    const [eh, em] = filteredSlots.end.split(':').map(Number);
    return (h > sh || (h === sh && m >= sm)) && (h < eh || (h === eh && m < em));
  });

  const cellHeight = 'h-9';

  const cu = USERS.find((u) => u.id === currentUser)!;

  return (
    <div>
      {/* Top bar */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <h2 className='text-lg font-bold text-foreground' style={{ fontFamily: 'Playfair Display, serif' }}>约饭日历</h2>
          <div className='flex gap-1.5'>
            {USERS.map((u) => (
              <button key={u.id} type='button' onClick={() => setCurrentUser(u.id)}
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
            点击格子标记 <strong style={{ color: cu.color }}>{cu.name}</strong> 的空闲时间
          </span>
        </div>
        {/* Interval tabs */}
        <div className='flex gap-1 bg-card border border-border rounded-xl p-1'>
          {intervals.map((iv) => (
            <button key={iv.label} type='button' onClick={() => setInterval(iv.label)}
              className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (interval === iv.label ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground')}
              style={interval === iv.label ? { backgroundColor: iv.color + '15', color: iv.color } : {}}>
              {iv.icon} {iv.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className='bg-card border border-border rounded-2xl overflow-auto'>
        <div className='min-w-[700px]'>
          {/* Header */}
          <div className='grid border-b border-border sticky top-0 bg-card z-10' style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
            <div className='p-3' />
            {DAYS.map((day) => (
              <div key={day} className='p-3 text-center border-l border-border'>
                <p className='text-xs font-bold text-foreground'>{day}</p>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {timeSlots.map((time) => (
            <div key={time} className='grid border-b border-border/40' style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
              <div className={'flex items-center justify-end pr-3 ' + cellHeight}>
                <span className='text-[11px] text-muted-foreground leading-none'
                  style={{ fontFamily: 'DM Mono, monospace' }}>{time}</span>
              </div>
              {DAYS.map((day) => {
                const key = day + '_' + time;
                const users = slots[key] || [];
                const isMine = users.includes(currentUser);
                const count = users.length;

                let bg = 'transparent';
                let border = 'transparent';
                if (count === 1) {
                  const u = USERS.find((x) => x.id === users[0])!;
                  bg = u.color + '35';
                  border = u.color + '60';
                } else if (count === 2) {
                  bg = '#BF4E2A55';
                  border = '#BF4E2A80';
                } else if (count >= 3) {
                  bg = '#BF4E2A88';
                  border = '#BF4E2A';
                }

                return (
                  <button key={day} type='button' onClick={() => toggle(day, time)}
                    className={cellHeight + ' border-l border-border/40 relative transition-all hover:opacity-80 group'}
                    style={{ backgroundColor: bg, borderTopColor: border }}>
                    {count > 0 && (
                      <div className='absolute bottom-1 left-1 flex gap-0.5 flex-wrap'>
                        {users.slice(0, 3).map((uid) => {
                          const u = USERS.find((x) => x.id === uid)!;
                          return <div key={uid} className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: u.color }} />;
                        })}
                      </div>
                    )}
                    <div className={'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'}
                      style={{ backgroundColor: isMine ? cu.color + '20' : cu.color + '15' }}>
                      {!isMine && <Plus className='w-3 h-3 text-foreground/30' />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className='flex items-center gap-6 mt-4 px-2'>
        <p className='text-xs text-muted-foreground'>图例：</p>
        {USERS.map((u) => (
          <div key={u.id} className='flex items-center gap-1.5'>
            <div className='w-3 h-3 rounded-sm' style={{ backgroundColor: u.color + '60' }} />
            <span className='text-xs text-muted-foreground'>{u.name}</span>
          </div>
        ))}
        <div className='flex items-center gap-1.5 ml-auto'>
          <div className='w-3 h-3 rounded-sm' style={{ backgroundColor: '#BF4E2A88' }} />
          <span className='text-xs text-muted-foreground'>3人重叠</span>
          <div className='w-3 h-3 rounded-sm ml-2' style={{ backgroundColor: '#BF4E2A55' }} />
          <span className='text-xs text-muted-foreground'>2人重叠</span>
        </div>
      </div>
    </div>
  );
}
