import React, { useState } from 'react';
import { LogIn, Sparkles, Loader2 } from 'lucide-react';

export default function AuthPage({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 900);
  };

  return (
    <div className='min-h-screen bg-background flex' style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Left visual panel */}
      <div className='hidden lg:flex flex-1 relative overflow-hidden bg-[#0C0805]'>
        <img
          src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=1200&fit=crop&auto=format'
          alt=''
          className='w-full h-full object-cover opacity-40'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-[#0C0805] via-transparent to-[#0C0805]/60' />
        <div className='absolute bottom-10 left-10 max-w-sm'>
          <div className='flex items-center gap-2.5 mb-4'>
            <div className='w-8 h-8 rounded-lg bg-[#BF4E2A] flex items-center justify-center'>
              <LogIn className='w-4 h-4 text-white' />
            </div>
            <span className='text-xl font-bold text-white' style={{ fontFamily: 'Playfair Display, serif' }}>Eato</span>
          </div>
          <p className='text-3xl font-bold text-white leading-tight' style={{ fontFamily: 'Playfair Display, serif' }}>
            '每一餐都值得被记住'
          </p>
          <p className='text-sm text-white/50 mt-3'>用 Eato 记录和分享你的美食故事</p>
        </div>
      </div>

      {/* Form */}
      <div className='flex-1 flex items-center justify-center px-8 py-12'>
        <div className='w-full max-w-sm'>
          {/* Logo */}
          <div className='flex items-center gap-2.5 mb-8'>
            <div className='w-8 h-8 rounded-lg bg-primary flex items-center justify-center'>
              <Sparkles className='w-4 h-4 text-primary-foreground' />
            </div>
            <span className='text-xl font-bold text-foreground' style={{ fontFamily: 'Playfair Display, serif' }}>Eato</span>
          </div>

          <h2 className='text-2xl font-bold text-foreground mb-1' style={{ fontFamily: 'Playfair Display, serif' }}>
            {mode === 'login' ? '欢迎回来' : '加入 Eato'}
          </h2>
          <p className='text-sm text-muted-foreground mb-8'>
            {mode === 'login' ? '继续你们的美食之旅' : '创建账号，开始约饭'}
          </p>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {mode === 'signup' && (
              <div>
                <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5'>昵称</label>
                <input type='text' value={name} onChange={(e) => setName(e.target.value)} placeholder='你的昵称'
                  className='w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50' />
              </div>
            )}
            <div>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5'>邮箱</label>
              <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='your@email.com'
                className='w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50' />
            </div>
            <div>
              <label className='text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5'>密码</label>
              <input type='password' value={pass} onChange={(e) => setPass(e.target.value)} placeholder='••••••••'
                className='w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50' />
            </div>

            <button type='submit' disabled={loading}
              className='w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-2'
              style={{ backgroundColor: '#BF4E2A', color: 'white' }}>
              {loading ? '验证中...' : mode === 'login' ? '登录' : '创建账号'}
            </button>
          </form>

          <div className='flex items-center gap-3 my-6'>
            <div className='flex-1 h-px bg-border' />
            <span className='text-xs text-muted-foreground'>或者</span>
            <div className='flex-1 h-px bg-border' />
          </div>

          <button type='button'
            className='w-full py-3 rounded-xl border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2.5 hover:bg-secondary transition-colors'>
            <span className='text-lg'>G</span>
            使用 Google 账号继续
          </button>

          <p className='text-center text-sm text-muted-foreground mt-8'>
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
            <button type='button' onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className='font-semibold text-primary ml-1 hover:underline'>
              {mode === 'login' ? '立即注册' : '去登录'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
