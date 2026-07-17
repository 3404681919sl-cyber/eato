import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import CalendarLegend from './CalendarLegend';

const intervals = [
  { label: '午餐', start: '11:00', end: '14:00', color: '#BF4E2A', icon: '☀️' },
  { label: '下午茶', start: '14:00', end: '17:00', color: '#D97706', icon: '🍵' },
  { label: '晚餐', start: '17:00', end: '21:30', color: '#2563EB', icon: '🌙' },
];

export default function CalendarView({ slots, setSlots }: {
  slots: Record<string, string[]>;
  setSlots: (s: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void;
}) {
  const [currentUser, setCurrentUser] = useState('a');
  const [interval, setInterval] = useState('晚餐');

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

  return (
    <div>
      <CalendarHeader
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        interval={interval}
        intervals={intervals}
        onIntervalChange={setInterval}
      />
      <CalendarGrid
        slots={slots}
        currentUser={currentUser}
        onToggle={toggle}
        intervalLabel={interval}
        intervals={intervals}
      />
      <CalendarLegend />
    </div>
  );
}
