import { MapPin, LogIn, ArrowRight } from "lucide-react";

const photos = [
  "https://images.unsplash.com/photo-1614104030967-5ca61a54247b?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1512132411229-c30391241dd8?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1564327367919-cb377ea6a88f?w=400&h=500&fit=crop&auto=format",
];

export default function LandingPage({ onAuth }: { onAuth: () => void }) {
  return (
    <div className="min-h-screen bg-[#0C0805] text-white overflow-hidden" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#BF4E2A] flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "Playfair Display, serif" }}>Eato</span>
        </div>
        <button onClick={onAuth}
          className="flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
          <LogIn className="w-3.5 h-3.5" />
          登录 / 注册
        </button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background image collage */}
        <div className="absolute inset-0 flex">
          {photos.map((src, i) => (
            <div key={i} className="flex-1 relative overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover opacity-30" style={{ filter: "saturate(0.6)" }} />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C0805] via-[#0C0805]/70 to-[#0C0805]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0805] via-transparent to-[#0C0805]/80" />
        </div>

        <div className="relative text-center px-6">
          <h1 className="text-[120px] leading-none font-bold tracking-tight mb-4"
            style={{ fontFamily: "Playfair Display, serif" }}>
            Eato
          </h1>
          <p className="text-xl text-white/60 mb-10" style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic" }}>
            和朋友一起发现、打卡、记录
          </p>
          <button onClick={onAuth}
            className="inline-flex items-center gap-2.5 text-sm font-semibold px-8 py-3.5 rounded-full transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#BF4E2A", color: "white" }}>
            开始约饭
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
