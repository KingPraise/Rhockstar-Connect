import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative bg-[#020617] text-white overflow-hidden">
      {/* Neomorphic Glows */}
      <div className="neo-glow bg-brand/10 w-[800px] h-[800px] top-[-300px] left-[-200px]" />
      <div className="neo-glow bg-brand-purple/10 w-[600px] h-[600px] bottom-[20%] right-[-100px]" style={{ animationDelay: '3s' }} />

      {/* ================= NAVBAR ================= */}
      <header className="fixed top-6 left-0 right-0 w-full max-w-7xl mx-auto px-6 z-50">
        <div className="neo-card flex justify-between items-center px-6 py-4 border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center neo-card shadow-brand/30 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-white text-lg">R</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">Rhockstar Connect</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-300">
            <Link href="#home" className="hover:text-white transition-colors">Home</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#about" className="hover:text-white transition-colors">About</Link>
            <Link href="/login" className="hover:text-brand transition-colors">Login</Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login" className="neo-button-secondary md:hidden px-5 py-2">Login</Link>
            <Link href="/register" className="neo-button-primary px-6 py-2 shadow-none hover:shadow-brand/20">Join Now</Link>
          </div>
        </div>
      </header>
        
      <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pt-40 pb-20">
        {/* ================= HOME ================= */}
        <section id="home" className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/30 bg-brand/5 text-brand text-sm font-semibold tracking-wide neo-card">
              <span className="animate-pulse">🚀</span> The Future of Professional Networking
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
              Connect.<br/>
              Grow.<br/>
              <span className="text-gradient">Build Your Future.</span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Rhockstar Connect helps professionals, entrepreneurs and creators discover opportunities, build relationships and grow their digital identity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/register" className="neo-button-primary py-4 px-8 text-lg w-full sm:w-auto">
                Get Started
              </Link>
              <Link href="/login" className="neo-button-secondary py-4 px-8 text-lg w-full sm:w-auto text-center">
                Login
              </Link>
            </div>
          </div>

          {/* APP PREVIEW (NEOMORPHIC) */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="neo-card p-4 bg-slate-900/50 backdrop-blur-2xl border border-white/10 animate-float">
              <div className="flex gap-2 mb-6 px-2 pt-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              
              <div className="space-y-4">
                <div className="neo-card p-4 bg-slate-800/30 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(56,189,248,0.3)]">R</div>
                  <div>
                    <h4 className="font-bold">Rhockstar User</h4>
                    <p className="text-xs text-slate-400">Software Developer</p>
                  </div>
                </div>

                <div className="space-y-3 pl-4">
                  <div className="neo-card p-4 bg-slate-800/20 border-l-4 border-l-brand flex items-center gap-3">
                    <span className="text-xl">💼</span>
                    <span className="font-medium text-sm">New Job Opportunity</span>
                  </div>
                  <div className="neo-card p-4 bg-slate-800/20 border-l-4 border-l-brand-purple flex items-center gap-3 ml-4">
                    <span className="text-xl">🤝</span>
                    <span className="font-medium text-sm">New Connection</span>
                  </div>
                  <div className="neo-card p-4 bg-slate-800/20 border-l-4 border-l-emerald-500 flex items-center gap-3 ml-8">
                    <span className="text-xl">💬</span>
                    <span className="font-medium text-sm">New Message</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-32">
          {[
            { label: "Professionals Connected", value: "10K+" },
            { label: "Opportunities Shared", value: "500+" },
            { label: "Community Access", value: "24/7" },
            { label: "Secure Platform", value: "100%" },
          ].map((stat, i) => (
            <div key={i} className="neo-card p-6 text-center bg-slate-900/40 border border-white/5 hover:-translate-y-2 transition-transform">
              <h3 className="text-3xl font-black text-brand mb-2 text-gradient">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
            </div>
          ))}
        </section>
          
        {/* FEATURES */}
        <section id="features" className="mt-40">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Rhockstar Connect?</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-brand to-brand-purple mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🌐", title: "Networking", desc: "Meet professionals, entrepreneurs and like-minded people." },
              { icon: "💼", title: "Job Board", desc: "Find internships, remote work and full-time career opportunities." },
              { icon: "💬", title: "Messaging", desc: "Chat securely with your connections anytime." },
              { icon: "👤", title: "Professional Profile", desc: "Showcase your skills, achievements and experience." },
              { icon: "📢", title: "Community Feed", desc: "Share updates, ideas and engage with the community." },
              { icon: "🔒", title: "Secure Platform", desc: "Your information is protected with modern security practices." },
            ].map((feature, i) => (
              <div key={i} className="neo-card p-8 group hover:border-brand/30 transition-all">
                <div className="w-14 h-14 rounded-2xl neo-card bg-slate-800/50 flex items-center justify-center text-2xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="mt-40 neo-card p-12 bg-slate-900/40 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-8">About Rhockstar Connect</h2>
            <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
              <p>
                Rhockstar Connect is a modern professional social networking platform
                built to connect people with opportunities. Whether you&apos;re searching
                for jobs, building business relationships, making friends, or expanding
                your professional network, Rhockstar Connect provides everything you
                need in one place.
              </p>
              <p>
                Our mission is to empower individuals by creating meaningful
                connections that inspire growth, collaboration and success.
              </p>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="mt-40 mb-20 text-center">
          <div className="neo-card p-16 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-brand/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white relative z-10">Ready to Build Your Future?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 relative z-10">
              Join Rhockstar Connect today and connect with professionals, opportunities and communities.
            </p>
            <div className="relative z-10">
              <Link href="/register" className="neo-button-primary py-4 px-10 text-lg shadow-[0_0_40px_rgba(56,189,248,0.4)]">
                Create Your Account
              </Link>
            </div>
          </div>
        </section>
      </main>
        
      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/5 bg-slate-900/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-brand-purple flex items-center justify-center neo-card shadow-brand/30 mb-6">
            <span className="font-extrabold text-white text-xl">R</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Rhockstar Connect</h3>
          <p className="text-slate-400 mb-8 max-w-md">Connect. Grow. Build your professional identity.</p>
          
          <nav className="flex gap-8 font-medium text-slate-300 mb-12">
            <Link href="#home" className="hover:text-brand transition-colors">Home</Link>
            <Link href="/register" className="hover:text-brand transition-colors">Register</Link>
            <Link href="/login" className="hover:text-brand transition-colors">Login</Link>
          </nav>
          
          <div className="text-slate-500 text-sm space-y-2">
            <p className="font-medium">© 2026 Rhockstar Connect. All Rights Reserved.</p>
            <p>Designed with ❤️ by Elijah Peter (Rhockstar)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
