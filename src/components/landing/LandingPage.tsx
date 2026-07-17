import React from 'react';
import { MapPin, LogIn, ArrowRight, Sparkles, Star, Utensils, CalendarPlus, TrendingUp } from 'lucide-react';

const photos = [
  'https://images.unsplash.com/photo-1614104030967-5ca61a54247b?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1512132411229-c30391241dd8?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1564327367919-cb377ea6a88f?w=400&h=500&fit=crop&auto=format',
];

export default function LandingPage({ onAuth }: { onAuth: () => void }) {
  return (
    <div className='min-h-screen bg-[#0C0805] text-white overflow-x-hidden' style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Nav */}
      <nav className='fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5'>
        <div className='flex items-center gap-2.5'>
          <div className='w-7 h-7 rounded-lg bg-[#BF4E2A] flex items-center justify-center'>
            <MapPin className='w-3.5 h-3.5 text-white' />
          </div>
          <span className='text-lg font-bold tracking-tight' style={{ fontFamily: 'Playfair Display, serif' }}>Eato</span>
        </div>
        <button onClick={onAuth}
          className='flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors'>
          <LogIn className='w-3.5 h-3.5' />
          登录 / 注册
        </button>
      </nav>

      {/* Hero */}
      <section className='relative min-h-screen flex items-center'>
        <div className='absolute inset-0 flex'>
          {photos.map((src, i) => (
            <div key={i} className='flex-1 relative overflow-hidden'>
              <img src={src} alt='' className='w-full h-full object-cover opacity-30' style={{ filter: 'saturate(0.6)' }} />
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

            {/* Stats */}
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

      {/* Features */}
      <section className='py-24 px-10'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-16'>
            <p className='text-sm font-semibold mb-3' style={{ color: '#BF4E2A' }}>功能特性</p>
            <h2 className='text-4xl font-bold' style={{ fontFamily: 'Playfair Display, serif' }}>
              一款应用，搞定所有美食计划
            </h2>
          </div>

          <div className='grid grid-cols-3 gap-6'>
            {[
              { icon: <Utensils className='w-6 h-6' />, title: '打卡清单', desc: '收藏想去的餐厅，标注心仪菜品，记录每次打卡评价', color: '#BF4E2A' },
              { icon: <CalendarPlus className='w-6 h-6' />, title: '约饭日历', desc: '和朋友一起安排时间，避免时间冲突，轻松组局', color: '#2563EB' },
              { icon: <TrendingUp className='w-6 h-6' />, title: '数据分析', desc: '直观了解消费趋势、品类偏好，做出更明智的选择', color: '#16A34A' },
              { icon: <Star className='w-6 h-6' />, title: '评分系统', desc: '记录每次用餐体验，积累你的美食评价体系', color: '#D97706' },
              { icon: <Sparkles className='w-6 h-6' />, title: '智能比价', desc: '一键对比各平台优惠，找到最划算的用餐方案', color: '#7C3AED' },
              { icon: <MapPin className='w-6 h-6' />, title: '好友协作', desc: '和小伙伴一起规划，每人标记空闲时间，自动匹配', color: '#EA580C' },
            ].map((f, i) => (
              <div key={i} className='rounded-2xl p-8 transition-all hover:-translate-y-1'
                style={{ backgroundColor: '#FFFFFF08', border: '1px solid #FFFFFF10' }}>
                <div className='w-12 h-12 rounded-xl flex items-center justify-center mb-5' style={{ backgroundColor: f.color + '20' }}>
                  <div style={{ color: f.color }}>{f.icon}</div>
                </div>
                <h3 className='text-lg font-semibold mb-2'>{f.title}</h3>
                <p className='text-sm text-white/50 leading-relaxed'>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-24 px-10 text-center' style={{ backgroundColor: '#BF4E2A10' }}>
        <div className='max-w-xl mx-auto'>
          <h2 className='text-4xl font-bold mb-4' style={{ fontFamily: 'Playfair Display, serif' }}>
            准备好开启美食之旅了吗？
          </h2>
          <p className='text-white/60 mb-8'>
            加入 Eato，和朋友一起记录、规划、分享每一顿美好时光。
          </p>
          <button onClick={onAuth}
            className='flex items-center gap-2.5 text-sm font-semibold px-8 py-3.5 rounded-full mx-auto transition-all hover:opacity-90 active:scale-95'
            style={{ backgroundColor: '#BF4E2A', color: 'white' }}>
            免费开始使用
            <ArrowRight className='w-4 h-4' />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className='py-10 text-center text-sm text-white/30'>
        <p>&copy; 2026 Eato. All rights reserved.</p>
      </footer>
    </div>
  );
}
