import { useState } from "react";
import { MapPin } from "lucide-react";
import type { AuthMode } from "@/types";

interface AuthPageProps {
  mode: AuthMode;
  onModeChange: (m: AuthMode) => void;
  onLogin: () => void;
}

export default function AuthPage({ mode, onModeChange, onLogin }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* Left — visual panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden" style={{ backgroundColor: "#0C0805" }}>
        <img
          src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&h=1200&fit=crop&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0C0805] via-[#0C0805]/40 to-transparent" />
        <div className="relative flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-[#BF4E2A] flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>Eato</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
            每一顿饭，
            <br />
            <span style={{ fontStyle: "italic", color: "#E8963C" }}>都值得被记录</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            与你最重要的朋友一起创建共享打卡本，记录你们走过的每一家餐厅，留下属于你们的美食足迹。
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>Eato</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
            {mode === "login" ? "欢迎回来" : "加入 Eato"}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === "login" ? "继续你们的美食之旅" : "创建账号，开始约饭"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">昵称</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="你的昵称"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">邮箱</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">密码</label>
              <input
                type="password" value={pass} onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#BF4E2A", color: "white" }}
            >
              {loading ? "验证中…" : mode === "login" ? "登录" : "创建账号"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">或者</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button className="w-full py-3 rounded-xl border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2.5 hover:bg-secondary transition-colors">
            <span className="text-lg">G</span>
            使用 Google 账号继续
          </button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {mode === "login" ? "还没有账号？" : "已有账号？"}
            <button
              onClick={() => onModeChange(mode === "login" ? "signup" : "login")}
              className="font-semibold text-primary ml-1 hover:underline"
            >
              {mode === "login" ? "立即注册" : "去登录"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
