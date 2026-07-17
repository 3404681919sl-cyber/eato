import React, { useMemo } from 'react';
import { TrendingUp, Wallet, Target, Star, Utensils, Clock, Users, Heart } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Place } from '../../types';
import { CAT, USERS, PIE_COLORS } from '../../constants';

export default function AnalyticsView({ places }: { places: Place[] }) {
  const d = useMemo(() => {
    const checked = places.flatMap((p) => p.visits.filter((v) => v.checkedIn).map((v) => ({ place: p, visit: v })));
    const pending = places.flatMap((p) => p.visits.filter((v) => !v.checkedIn));
    const totalSpent = checked.reduce((s, x) => s + Number(x.visit.spending || 0), 0);
    const avgPer = checked.length ? Math.round(totalSpent / checked.length) : 0;

    // By category
    const byCat: Record<string, { label: string; count: number; spent: number; color: string; emoji: string }> = {};
    checked.forEach(({ place, visit }) => {
      const c = CAT[place.category];
      if (!byCat[place.category]) byCat[place.category] = { label: c.label, count: 0, spent: 0, color: c.color, emoji: c.emoji };
      byCat[place.category].count++;
      byCat[place.category].spent += Number(visit.spending || 0);
    });
    const byPlace = Object.entries(byCat).map(([k, v]) => ({ name: v.label, value: v.count, color: v.color, emoji: v.emoji }));

    // Monthly spending
    const currentMonth = '七月';
    const monthly = [
      { name: '一月', spent: 0 }, { name: '二月', spent: 0 }, { name: '三月', spent: 0 },
      { name: '四月', spent: 1240 }, { name: '五月', spent: 1860 }, { name: '六月', spent: 2130 },
      { name: currentMonth, spent: totalSpent },
    ];

    // Mood distribution
    const moodCount: Record<string, number> = {};
    places.forEach((p) => { moodCount[p.mood] = (moodCount[p.mood] || 0) + p.visits.length; });

    // Top restaurants
    const topPlaces = [...places].sort((a, b) => b.stars - a.stars).slice(0, 5);

    // Pairs dining
    const pairCounts: Record<string, { pair: string[]; count: number }> = {};
    const pairs = [
      { pair: ['小美', '阿帅'], count: 7, color: '#BF4E2A' },
      { pair: ['小美', '阿豪'], count: 5, color: '#16A34A' },
      { pair: ['阿帅', '阿豪'], count: 3, color: '#2563EB' },
    ];

    return { checked: checked.length, pending: pending.length, totalSpent, avgPer, byPlace, monthly, moodCount, topPlaces, pairs };
  }, [places]);

  const statCards = [
    { icon: <TrendingUp className='w-5 h-5' />, label: '总消费', value: '¥' + d.totalSpent.toLocaleString(), color: '#BF4E2A', bg: '#BF4E2A10' },
    { icon: <Wallet className='w-5 h-5' />, label: '平均每次', value: '¥' + d.avgPer, color: '#D97706', bg: '#D9770610' },
    { icon: <Target className='w-5 h-5' />, label: '已打卡', value: d.checked + ' 次', color: '#16A34A', bg: '#16A34A10' },
    { icon: <Clock className='w-5 h-5' />, label: '待打卡', value: d.pending + ' 次', color: '#2563EB', bg: '#2563EB10' },
  ];

  return (
    <div className='space-y-6'>
      {/* Stat cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map((s) => (
          <div key={s.label} className='rounded-2xl px-5 py-4 border border-border' style={{ backgroundColor: s.bg }}>
            <div className='flex items-center gap-2.5 mb-3'>
              <div className='w-9 h-9 rounded-xl flex items-center justify-center' style={{ backgroundColor: s.color + '20' }}>
                <div style={{ color: s.color }}>{s.icon}</div>
              </div>
            </div>
            <p className='text-xl font-bold' style={{ fontFamily: 'DM Mono, monospace', color: s.color }}>{s.value}</p>
            <p className='text-xs text-muted-foreground mt-0.5'>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Pie chart - by category */}
        <div className='bg-card border border-border rounded-2xl px-6 py-5'>
          <h3 className='text-sm font-semibold text-foreground mb-1'>品类分布</h3>
          <p className='text-xs text-muted-foreground mb-4'>按餐厅类别统计打卡次数</p>
          {d.byPlace.length > 0 ? (
            <div className='flex items-center gap-4'>
              <ResponsiveContainer width='60%' height={200}>
                <PieChart>
                  <Pie data={d.byPlace} cx='50%' cy='50%' innerRadius={58} outerRadius={90} paddingAngle={3} dataKey='value'>
                    {d.byPlace.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{
                    borderRadius: '12px', border: '1px solid rgba(150,100,50,0.16)', fontSize: '12px', backgroundColor: '#FFFCF6',
                  }} />
                </PieChart>
              </ResponsiveContainer>
              <div className='flex flex-col gap-2 text-xs'>
                {d.byPlace.map((item) => (
                  <div key={item.name} className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full' style={{ backgroundColor: item.color }} />
                    <span className='text-muted-foreground'>{item.emoji} {item.name}</span>
                    <span className='font-semibold text-foreground' style={{ fontFamily: 'DM Mono, monospace' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground py-6 text-center'>还没有打卡记录，开始记录美食之旅吧！</p>
          )}
        </div>

        {/* Bar chart - monthly */}
        <div className='bg-card border border-border rounded-2xl px-6 py-5'>
          <h3 className='text-sm font-semibold text-foreground mb-1'>月度消费趋势</h3>
          <p className='text-xs text-muted-foreground mb-4'>近七个月总消费（元）</p>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={d.monthly} barSize={18}>
              <XAxis dataKey='name' tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => '¥' + v} />
              <Tooltip contentStyle={{
                borderRadius: '12px', border: '1px solid rgba(150,100,50,0.16)', fontSize: '12px', backgroundColor: '#FFFCF6',
              }} />
              <Bar dataKey='spent' radius={[6, 6, 0, 0]}>
                {d.monthly.map((_, i) => (
                  <Cell key={i} fill={i === d.monthly.length - 1 ? '#BF4E2A' : '#BF4E2A60'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top restaurants + pairs */}
      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Top rated */}
        <div className='bg-card border border-border rounded-2xl px-6 py-5'>
          <h3 className='text-sm font-semibold text-foreground mb-1'>🏆 高分餐厅</h3>
          <p className='text-xs text-muted-foreground mb-4'>评分最高的收藏餐厅</p>
          <div className='space-y-3'>
            {d.topPlaces.map((p) => (
              <div key={p.id} className='flex items-center gap-3'>
                {p.image ? (
                  <img src={p.image} alt='' className='w-10 h-10 rounded-xl object-cover'
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className='w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xs text-muted-foreground'>?</div>
                )}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-foreground truncate'>{p.name}</p>
                  <div className='flex items-center gap-2'>
                    <div className='flex gap-0.5'>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={'w-2.5 h-2.5 ' + (s <= p.stars ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20')} />
                      ))}
                    </div>
                    <span className='text-xs text-muted-foreground'>{CAT[p.category].emoji} {CAT[p.category].label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best dining pairs */}
        <div className='bg-card border border-border rounded-2xl px-6 py-5'>
          <h3 className='text-sm font-semibold text-foreground mb-1'>👫 约饭搭档</h3>
          <p className='text-xs text-muted-foreground mb-4'>一起吃饭最多的组合</p>
          <div className='space-y-3'>
            {d.pairs.map(({ pair, count, color }) => (
              <div key={pair.join('-')} className='flex items-center gap-3 rounded-2xl px-5 py-4 border border-border'
                style={{ backgroundColor: color + '08' }}>
                <div className='flex -space-x-2'>
                  {pair.map((name, i) => (
                    <div key={i} className='w-9 h-9 rounded-full border-2 border-card flex items-center justify-center text-white text-xs font-bold shadow-sm'
                      style={{ backgroundColor: USERS.find((u) => u.name === name)?.color ?? color }}>
                      {name[0]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className='text-sm font-semibold text-foreground'>{pair.join(' & ')}</p>
                  <p className='text-xs text-muted-foreground' style={{ fontFamily: 'DM Mono, monospace' }}>{count} 次约饭</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
