import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CTASection({ onAuth }: { onAuth: () => void }) {
  return (
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
  );
}
