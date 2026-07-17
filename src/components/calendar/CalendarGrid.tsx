import React from 'react';
import { Plus } from 'lucide-react';
import { DAYS, USERS, HOURS } from '../../constants';

export default function CalendarGrid({
  slots, currentUser, onToggle,
  intervalLabel, intervals,
}: {
  slots: Record<string, string[]>;
  currentUser: string;
  onToggle: (day: string, time: string) => void;
  intervalLabel: string;
  intervals: { label: string; start: string; end: string; color: string; icon: string }[];
}) {
  const filteredSlots = intervals.find((iv) => iv.label === intervalLabel)!;
  const timeSlots = HOURS.filter((t) => {
    const [h, m] = t.split(':').map(Number);
    const [sh, sm] = filteredSlots.start.split(':').map(Number);
    const [eh, em] = filteredSlots.end.split(':').map(Number);
    return (h > sh || (h === sh && m >= sm)) && (h < eh || (h === eh && m < em));
  });

  const cu = USERS.find((u) => u.id === currentUser)!;
  const cellHeight = 'h-9';

  return (
    <div className='bg-card border border-border rounded-2xl overflow-auto'>
      <div className='min-w-[700px]'>
        {/* Header row */}
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

              let bg = 'transparent';
              let border = 'transparent';
              const count = users.length;
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
                <button key={day} type='button' onClick={() => onToggle(day, time)}
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
  );
}
