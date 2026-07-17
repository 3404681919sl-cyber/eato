import React, { useState } from 'react';
import { Star, Check, Plus, Search, Clock, ChevronDown, Heart, ExternalLink, ChevronUp, BadgePercent } from 'lucide-react';
import type { Place, Visit, Category, Mood } from '../../types';
import { CAT, MOOD } from '../../constants';
import { StarRow, MoodPicker, CategoryPicker } from '../../utils';
import DealsPanel from '../deals/DealsPanel';

import EditableField from './EditableField';
export default function TableView({ places, setPlaces }: { places: Place[]; setPlaces: (p: Place[] | ((prev: Place[]) => Place[])) => void }) {
  const [expandedDeals, setExpandedDeals] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const mutPlace = (id: string, patch: Partial<Place>) => {
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const mutVisit = (placeId: string, visitId: string, patch: Partial<Visit>) => {
    setPlaces((prev) => prev.map((p) => p.id === placeId ? {
      ...p, visits: p.visits.map((v) => v.id === visitId ? { ...v, ...patch } : v),
    } : p));
  };
  const addVisit = (placeId: string) => {
    const p = places.find((x) => x.id === placeId);
    if (!p) return;
    const newVisit: Visit = { id: placeId + '-' + Date.now(), date: '', time: '', checkedIn: false, spending: '', review: '' };
    setPlaces((prev) => prev.map((x) => x.id === placeId ? { ...x, visits: [...x.visits, newVisit] } : x));
  };
  const addPlace = () => {
    if (!newName.trim()) return;
    const newPlace: Place = {
      id: 'p' + Date.now(), name: newName, image: '', stars: 0,
      category: 'other', mood: 'casual', plannedMenu: '', visits: [],
    };
    setPlaces((prev) => [...prev, newPlace]);
    setNewName('');
  };

  return (
    <div className='space-y-4'>
      {/* Add place bar */}
      <div className='flex items-center gap-3'>
        <div className='flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5'>
          <Search className='w-4 h-4 text-muted-foreground' />
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addPlace(); }}
            placeholder='搜索或添加餐厅...'
            className='flex-1 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/50' />
        </div>
        <button onClick={addPlace}
          className='px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5'>
          <Plus className='w-4 h-4' /> 添加
        </button>
      </div>

      {/* Table */}
      <div className='bg-card border border-border rounded-2xl overflow-hidden'>
        {/* Header */}
        <div className='grid gap-3 px-5 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider'
          style={ROW_GRID}>
          <span>餐厅</span><span>评分</span><span>分类</span><span>心情</span><span>已点菜单</span><span>打卡记录</span><span />
        </div>

        {/* Rows */}
        {places.map((place) => (
          <div key={place.id}>
            {place.visits.map((visit, vi) => {
              const isDealOpen = expandedDeals === visit.id;
              return (
                <div key={visit.id}
                  className={'grid gap-3 px-5 py-3 border-b border-border/40 items-start transition-colors'}
                  style={{ ...ROW_GRID, ...(isDealOpen ? { backgroundColor: '#BF4E2A0D' } : {}) }}>
                  {/* Restaurant name + image */}
                  <div className='flex items-center gap-3'>
                    {place.image ? (
                      <img src={place.image} alt='' className='w-9 h-9 rounded-xl object-cover flex-shrink-0'
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className='w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0'>?</div>
                    )}
                    <div className='min-w-0'>
                      <EditableField value={place.name} onChange={(v) => mutPlace(place.id, { name: v })} placeholder='餐厅名称' />
                    </div>
                  </div>

                  {/* Stars */}
                  <div className='pt-1'>
                    <StarRow value={place.stars} onChange={(v) => mutPlace(place.id, { stars: v })} />
                  </div>

                  {/* Category */}
                  <div className='pt-1'>
                    <CategoryPicker value={place.category} onChange={(v) => mutPlace(place.id, { category: v })} />
                  </div>

                  {/* Mood */}
                  <div className='pt-1'>
                    {vi === 0 && (
                      <MoodPicker value={place.mood} onChange={(v) => mutPlace(place.id, { mood: v })} />
                    )}
                  </div>

                  {/* Menu */}
                  <div className='pt-1 min-w-0'>
                    <EditableField value={place.plannedMenu} onChange={(v) => mutPlace(place.id, { plannedMenu: v })} placeholder='已点菜单' />
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
                        <input value={visit.spending} onChange={(e) => mutVisit(place.id, visit.id, { spending: e.target.value })}
                          placeholder='花费'
                          className='w-16 text-xs bg-transparent border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary/30'
                          style={{ fontFamily: 'DM Mono, monospace' }} />
                        <input value={visit.review} onChange={(e) => mutVisit(place.id, visit.id, { review: e.target.value })}
                          placeholder='评价...'
                          className='flex-1 text-xs bg-transparent border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary/30' />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className='flex items-center gap-1 pt-1'>
                    <button type='button' title='设为当前时间' onClick={() => mutVisit(place.id, visit.id, { checkedIn: !visit.checkedIn })}
                      className={'w-6 h-6 rounded-lg flex items-center justify-center transition-colors ' + (visit.checkedIn ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground hover:bg-secondary')}>
                      <Check className='w-3 h-3' />
                    </button>
                    {vi === 0 && (
                      <button type='button' onClick={() => addVisit(place.id)} title='再约一次'
                        className='w-6 h-6 rounded-lg bg-muted text-muted-foreground hover:bg-secondary flex items-center justify-center transition-colors'>
                        <Plus className='w-3 h-3' />
                      </button>
                    )}
                    <button type='button'
                      onClick={() => setExpandedDeals(isDealOpen ? null : visit.id)}
                      className={'w-6 h-6 rounded-lg flex items-center justify-center transition-colors '
                        + (isDealOpen ? 'text-white' : 'bg-muted text-muted-foreground hover:bg-secondary')}
                      style={isDealOpen ? { backgroundColor: '#BF4E2A' } : {}}>
                      {isDealOpen ? <ChevronUp className='w-3 h-3' /> : <BadgePercent className='w-3 h-3' />}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Expanded deals row */}
            {expandedDeals && places.find(p => p.visits.some(v => v.id === expandedDeals))?.id === place.id && (
              <div className='border-b border-border/40' style={{ backgroundColor: '#BF4E2A0D' }}>
                <DealsPanel
                  placeName={place.name}
                  category={place.category}
                  onClose={() => setExpandedDeals(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
