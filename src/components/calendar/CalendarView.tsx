import React, { useState } from "react";
import { INTERVALS } from "../../constants";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import CalendarLegend from "./CalendarLegend";

export default function CalendarView({ slots, setSlots }: {
  slots: Record<string, string[]>;
  setSlots: (s: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void;
}) {
  const [currentUser, setCurrentUser] = useState("a");
  const [interval, setInterval] = useState("晚餐");

  const toggle = (day: string, time: string) => {
    const key = day + "_" + time;
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
        intervals={INTERVALS}
        onIntervalChange={setInterval}
      />
      <CalendarGrid
        slots={slots}
        currentUser={currentUser}
        onToggle={toggle}
        intervalLabel={interval}
        intervals={INTERVALS}
      />
      <CalendarLegend />
    </div>
  );
}
