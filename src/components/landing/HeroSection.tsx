import React from 'react';
import { ArrowRight, Sparkles, Utensils, CalendarPlus, TrendingUp } from 'lucide-react';

export default function HeroSection({ onAuth }: { onAuth: () => void }) {
  return (
    <section className='relative min-h-screen flex items-center'>
      <div className='absolute inset-0 flex'>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className='flex-1 relative overflow-hidden'>
            <div className='w-full h-full opacity-30' style={{ backgroundColor: ['#BF4E2A', '#2C1810', '#4A1A0E', '#1A0C08'][i] }} />
          </div>
        ))}
        <div className='absolute inset-0 bg-gradient-to-r from-[#0C0805] via-[#0C0805]/60 to-[#0C0805]/40' />
        <div className='absolute inset-0 bg-gradient-to-t from-[#0C0805] via-transparent to-[#0C0805]/80' />
      </div>

      <div className='relative max-w-6xl mx-auto px-10 pt-24 pb-16'>
        <div className='max-w-xl'>
          <div className='inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-8'
            style={{ backgroundColor: '#BF4E2A20', color: '#BF4E2A', border: '1px solid #BF4E2A40' }}>
            <Sparkles className='w-3 h-3' />
            你的智能美食旅行规划助手
          </div>

          <h1 className='text-6xl font-bold leading-[1.1] mb-6' style={{ fontFamily: 'Playfair Display, serif' }}>
            记录美食足迹
            <br />
            <span style={{ color: '#BF4E2A' }}>规划每一次</span>
            <br />
            美味约会
          </h1>

          <p className='text-base text-white/60 mb-10 max-w-md leading-relaxed'>
            和朋友一起打卡收藏的餐厅，安排聚餐时间，分析消费习惯。
            <br />
            让每一顿都值得期待。
          </p>

          <div className='flex items-center gap-4'>
            <button onClick={onAuth}
              className='flex items-center gap-2.5 text-sm font-semibold px-7 py-3.5 rounded-full transition-all hover:opacity-90 active:scale-95'
              style={{ backgroundColor: '#BF4E2A', color: 'white' }}>
              开始使用
              <ArrowRight className='w-4 h-4' />
            </button>
            <button onClick={onAuth}
              className='px-7 py-3.5 rounded-full text-sm font-medium text-white/60 border border-white/15 hover:border-white/30 hover:text-white/80 transition-all'>
              了解更多
            </button>
          </div>

          <div className='flex items-center gap-10 mt-16'>
            {[
              { icon: <Utensils className='w-5 h-5' />, label: '餐厅收藏', value: '50+' },
              { icon: <CalendarPlus className='w-5 h-5' />, label: '聚餐安排', value: '200+' },
              { icon: <TrendingUp className='w-5 h-5' />, label: '消费分析', value: '实时' },
            ].map((s, i) => (
              <div key={i} className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl flex items-center justify-center' style={{ backgroundColor: '#FFFFFF10' }}>
                  {s.icon}
                </div>
                <div>
                  <p className='text-lg font-bold'>{s.value}</p>
                  <p className='text-xs text-white/40'>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
