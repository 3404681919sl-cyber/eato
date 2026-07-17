import React, { useState } from 'react';
import type { Place, Visit } from '../../types';
import { useLocale } from '../../i18n';
import { TABLE_ROW_GRID as ROW_GRID } from '../../constants';
import PlaceSearchAdd from './PlaceSearchAdd';
import PlaceRow from './PlaceRow';
import DealsPanel from '../deals/DealsPanel';

export default function TableView({ places, setPlaces }: { places: Place[]; setPlaces: (p: Place[] | ((prev: Place[]) => Place[])) => void }) {
  const { t } = useLocale();
  const [expandedDeals, setExpandedDeals] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const HEADERS = [t('table.header.restaurant'), t('table.header.rating'), t('table.header.category'), t('table.header.mood'), t('table.header.menu'), t('table.header.records'), ''] as const;

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
      <PlaceSearchAdd value={newName} onChange={setNewName} onAdd={addPlace} />
      <div className='bg-card border border-border rounded-2xl overflow-hidden'>
        <div className='grid gap-3 px-5 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider' style={ROW_GRID}>
          {HEADERS.map((h) => <span key={h}>{h}</span>)}
        </div>
        {places.map((place) => (
          <div key={place.id}>
            {place.visits.map((visit, vi) => (
              <PlaceRow
                key={visit.id} place={place} visit={visit} vi={vi}
                isDealOpen={expandedDeals === visit.id}
                onToggleDeal={() => setExpandedDeals(isDealOpen ? null : visit.id)}
                onMutPlace={mutPlace} onMutVisit={mutVisit} onAddVisit={addVisit}
              />
            ))}
            {expandedDeals && places.find(p => p.visits.some(v => v.id === expandedDeals))?.id === place.id && (
              <div className='border-b border-border/40' style={{ backgroundColor: '#BF4E2A0D' }}>
                <DealsPanel placeName={place.name} category={place.category} onClose={() => setExpandedDeals(null)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
