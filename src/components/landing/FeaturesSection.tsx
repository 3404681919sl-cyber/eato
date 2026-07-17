import React from 'react';
import { Utensils, CalendarPlus, TrendingUp, Star, Sparkles, MapPin } from 'lucide-react';

const features = [
  { icon: <Utensils className='w-6 h-6' />, title: '打卡清单', desc: '收藏想去的餐厅，标注心仪菜品，记录每次打卡评价', color: '#BF4E2A' },
  { icon: <CalendarPlus className='w-6 h-6' />, title: '约饭日历', desc: '和朋友一起安排时间，避免时间冲突，轻松组局', color: '#2563EB' },
  { icon: <TrendingUp className='w-6 h-6' />, title: '数据分析', desc: '直观了解消费趋势、品类偏好，做出更明智的选择', color: '#16A34A' },
  { icon: <Star className='w-6 h-6' />, title: '评分系统', desc: '记录每次用餐体验，积累你的美食评价体系', color: '#D97706' },
  { icon: <Sparkles className='w-6 h-6' />, title: '智能比价', desc: '一键对比各平台优惠，找到最划算的用餐方案', color: '#7C3AED' },
  { icon: <MapPin className='w-6 h-6' />, title: '好友协作', desc: '和小伙伴一起规划，每人标记空闲时间，自动匹配', color: '#EA580C' },
];

export default function FeaturesSection() {
  return (
    <section className='py-24 px-10'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <p className='text-sm font-semibold mb-3' style={{ color: '#BF4E2A' }}>功能特色</p>
          <h2 className='text-4xl font-bold' style={{ fontFamily: 'Playfair Display, serif' }}>
            一款应用，搞定所有美食计划
          </h2>
        </div>

        <div className='grid grid-cols-3 gap-6'>
          {features.map((f, i) => (
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
  );
}
