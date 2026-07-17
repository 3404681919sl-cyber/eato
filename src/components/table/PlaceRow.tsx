import React from 'react';
import { Check, Plus, BadgePercent, ChevronUp } from 'lucide-react';
import type { Place, Visit } from '../../types';
import EditableField from './EditableField';
import { StarRow, MoodPicker, CategoryPicker } from '../../utils';
import PlaceAvatar from './PlaceAvatar';

interface PlaceRowProps {
  place: Place;
  visit: Visit;
  vi: number;
  isDealOpen: boolean;
  onToggleDeal: () => void;
  onMutPlace: (id: string, patch: Partial<Place>) => void;
  onMutVisit: (placeId: string, visitId: string, patch: Partial<Visit>) => void;
  onAddVisit: (placeId: string) => void;
}

import { TABLE_ROW_GRID as ROW_GRID } from "../../constants";

export default function PlaceRow({ place, visit, vi, isDealOpen, onToggleDeal, onMutPlace, onMutVisit, onAddVisit }: PlaceRowProps) {
  return (
    <div className={'grid gap-3 px-5 py-3 border-b border-border/40 items-start transition-colors'}
      style={{ ...ROW_GRID, ...(isDealOpen ? { backgroundColor: '#BF4E2A0D' } : {}) }}>
      {/* Restaurant name + image */}
      <div className='flex items-center gap-3'>
        <PlaceAvatar place={place} sizePx={36} />
        <div className='min-w-0'>
          <EditableField value={place.name} onChange={(v) => onMutPlace(place.id, { name: v })} placeholder='餐厅名称' />
        </div>
      </div>

      {/* Stars */}
      <div className='pt-1'>
        <StarRow value={place.stars} onChange={(v) => onMutPlace(place.id, { stars: v })} />
      </div>

      {/* Category */}
      <div className='pt-1'>
        <CategoryPicker value={place.category} onChange={(v) => onMutPlace(place.id, { category: v })} />
      </div>

      {/* Mood */}
      <div className='pt-1'>
        {vi === 0 && (
          <MoodPicker value={place.mood} onChange={(v) => onMutPlace(place.id, { mood: v })} />
        )}
      </div>

      {/* Menu */}
      <div className='pt-1 min-w-0'>
        <EditableField value={place.plannedMenu} onChange={(v) => onMutPlace(place.id, { plannedMenu: v })} placeholder='已点菜单' />
      </div>

      {/* Visit info */}
      <div className='pt-1 space-y-0.5 min-w-0'>
        <div className='flex items-center gap-2 text-xs'>
          {visit.date && <span className='text-muted-foreground'>{visit.date}</span>}
          {visit.time && <span className='text-muted-foreground' style={{ fontFamily: 'DM Mono, monospace' }}>{visit.time}</span>}
          {visit.checkedIn && visit.spending && (
            <span className='font-semibold' style={{ fontFamily: 'DM Mono, monospace', color: '#16A34A' }}>¥{visit.spending}</span>
          )}
        </div>
        {visit.checkedIn && visit.review && (
          <p className='text-xs text-muted-foreground truncate'>{visit.review}</p>
        )}
        {!visit.checkedIn && vi > 0 && (
          <span className='text-xs text-muted-foreground/50'>待打卡</span>
        )}

        {visit.checkedIn && (
          <div className='flex items-center gap-2 mt-1'>
            <input value={visit.spending} onChange={(e) => onMutVisit(place.id, visit.id, { spending: e.target.value })}
              placeholder='花费'
              className='w-16 text-xs bg-transparent border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary/30'
              style={{ fontFamily: 'DM Mono, monospace' }} />
            <input value={visit.review} onChange={(e) => onMutVisit(place.id, visit.id, { review: e.target.value })}
              placeholder='评价...'
              className='flex-1 text-xs bg-transparent border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary/30' />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className='flex items-center gap-1 pt-1'>
        <button type='button' title='设为当前时间' onClick={() => onMutVisit(place.id, visit.id, { checkedIn: !visit.checkedIn })}
          className={'w-6 h-6 rounded-lg flex items-center justify-center transition-colors ' + (visit.checkedIn ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground hover:bg-secondary')}>
          <Check className='w-3 h-3' />
        </button>
        {vi === 0 && (
          <button type='button' onClick={() => onAddVisit(place.id)} title='再约一次'
            className='w-6 h-6 rounded-lg bg-muted text-muted-foreground hover:bg-secondary flex items-center justify-center transition-colors'>
            <Plus className='w-3 h-3' />
          </button>
        )}
        <button type='button'
          onClick={onToggleDeal}
          className={'w-6 h-6 rounded-lg flex items-center justify-center transition-colors '
            + (isDealOpen ? 'text-white' : 'bg-muted text-muted-foreground hover:bg-secondary')}
          style={isDealOpen ? { backgroundColor: '#BF4E2A' } : {}}>
          {isDealOpen ? <ChevronUp className='w-3 h-3' /> : <BadgePercent className='w-3 h-3' />}
        </button>
      </div>
    </div>
  );
}

