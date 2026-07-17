import React from 'react';
import { USERS } from '../../constants';

export default function CalendarLegend() {
  return (
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
  );
}
