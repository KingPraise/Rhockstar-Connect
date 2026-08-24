"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const { profile } = useAuthStore();

  return (
    <div className="min-h-screen relative bg-[#020617] text-white overflow-hidden">
      {/* Neomorphic Glows */}
      <div className="neo-glow bg-brand/10 w-[800px] h-[800px] top-[-300px] left-[-200px]" />
      <div className="neo-glow bg-brand-purple/10 w-[600px] h-[600px] bottom-[20%] right-[-100px]" style={{ animationDelay: '3s' }} />

      {/* ================= NAVBAR ================= */}
      <header className="fixed top-6 left-0 right-0 w-full max-w-7xl mx-auto px-6 z-50">
        <div className="neo-card flex justify-between items-center px-6 py-4 border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-3 group cursor-pointer z-50">
            <Image src="/logo-light.png" alt="Rhockstar Connect" width={140} height={32} className="group-hover:opacity-80 transition-opacity" />
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-300">
            <Link href="#home" className="hover:text-white transition-colors">Home</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#about" className="hover:text-white transition-colors">About</Link>
            {!profile && <Link href="/login" className="hover:text-brand transition-colors">Login</Link>}
          </nav>
          <div className="flex gap-4">
            {profile ? (
              <Link href="/feed" className="neo-button-primary px-6 py-2 shadow-none hover:shadow-brand/20">Go to Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="neo-button-secondary md:hidden px-5 py-2">Login</Link>
                <Link href="/register" className="neo-button-primary px-6 py-2 shadow-none hover:shadow-brand/20">Join Now</Link>
              </>
            )}
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
              {profile ? (
                <Link href="/feed" className="neo-button-primary py-4 px-8 text-lg w-full sm:w-auto text-center">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className="neo-button-primary py-4 px-8 text-lg w-full sm:w-auto">
                    Get Started
                  </Link>
                  <Link href="/login" className="neo-button-secondary py-4 px-8 text-lg w-full sm:w-auto text-center">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* APP PREVIEW (NEOMORPHIC HERO IMAGE) */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-xl hidden md:block">
            <div className="relative rounded-3xl overflow-hidden neo-card border border-white/10 shadow-[0_0_50px_rgba(56,189,248,0.2)] animate-float">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
              <Image 
                src="/images/landing_networking.jpg" 
                alt="Rhockstar Connect Digital Network" 
                width={1000}
                height={600}
                className="w-full h-auto object-cover opacity-90"
              />
              
              <div className="absolute bottom-6 left-6 right-6 z-20 space-y-3">
                <div className="neo-card p-4 bg-slate-800/80 backdrop-blur-md border-l-4 border-l-brand flex items-center gap-3">
                  <span className="text-xl">💼</span>
                  <span className="font-bold text-sm text-white">New Premium Job Match</span>
                </div>
                <div className="neo-card p-4 bg-slate-800/80 backdrop-blur-md border-l-4 border-l-brand-purple flex items-center gap-3 ml-4">
                  <span className="text-xl">🚀</span>
                  <span className="font-bold text-sm text-white">It&apos;s a Match! Say Hello</span>
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
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Why Choose Rhockstar Connect?</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">Everything you need to network, grow your career, and build lasting connections.</p>
            <div className="h-1 w-20 bg-gradient-to-r from-brand to-brand-purple mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: "🌐", 
                title: "Professional Networking", 
                desc: "Meet professionals, entrepreneurs and like-minded individuals in a vibrant ecosystem.",
                image: "/images/landing_networking.jpg"
              },
              { 
                icon: "💼", 
                title: "Curated Job Board", 
                desc: "Find verified remote jobs, internships, and high-paying full-time career opportunities.",
                image: "/images/landing_job_board.jpg"
              },
              { 
                icon: "💬", 
                title: "Real-Time Messaging", 
                desc: "Chat securely with your connections, share documents, voice notes, and media instantly.",
                image: "/images/landing_messaging.jpg"
              },
              { 
                icon: "👤", 
                title: "Professional Profile", 
                desc: "Showcase your skills, achievements, portfolio, and verified badges to stand out.",
                image: "/images/landing_profile.jpg"
              },
              { 
                icon: "📢", 
                title: "Community Feed", 
                desc: "Share updates, exchange industry insights, and engage with professional discussions.",
                image: "/images/landing_feed.jpg"
              },
              { 
                icon: "🔒", 
                title: "Secure & Encrypted", 
                desc: "Your data and privacy are protected with modern encryption and security standards.",
                image: "/images/landing_security.jpg"
              },
            ].map((feature, i) => (
              <div key={i} className="neo-card overflow-hidden group hover:border-brand/30 transition-all flex flex-col">
                <div className="h-44 w-full relative overflow-hidden bg-slate-800">
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl neo-card bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-xl shadow-lg">
                    {feature.icon}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-brand transition-colors">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      {feature.desc}
                    </p>
                  </div>
                </div>
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
              {profile ? (
                <Link href="/feed" className="neo-button-primary py-4 px-10 text-lg shadow-[0_0_40px_rgba(56,189,248,0.4)]">
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/register" className="neo-button-primary py-4 px-10 text-lg shadow-[0_0_40px_rgba(56,189,248,0.4)]">
                  Create Your Account
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
        
      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/5 bg-slate-900/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center text-center">
          <Image src="/logo-light.png" alt="Rhockstar Connect" width={160} height={36} className="mb-6 opacity-90" />
          <h3 className="text-2xl font-bold mb-2">Rhockstar Connect</h3>
          <p className="text-slate-400 mb-8 max-w-md">Connect. Grow. Build your professional identity.</p>
          
          <nav className="flex gap-8 font-medium text-slate-300 mb-12">
            <Link href="#home" className="hover:text-brand transition-colors">Home</Link>
            {!profile && (
              <>
                <Link href="/register" className="hover:text-brand transition-colors">Register</Link>
                <Link href="/login" className="hover:text-brand transition-colors">Login</Link>
              </>
            )}
            {profile && <Link href="/feed" className="hover:text-brand transition-colors">Dashboard</Link>}
            <Link href="/terms" className="hover:text-brand transition-colors">Terms of Service</Link>
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
