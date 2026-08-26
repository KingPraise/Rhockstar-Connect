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
      <div className="neo-glow bg-rose-500/10 w-[600px] h-[600px] bottom-[20%] right-[-100px]" style={{ animationDelay: '3s' }} />

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm font-semibold tracking-wide neo-card">
              <span className="animate-pulse">❤️</span> Meet People, Find Love & Discover Opportunities
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight">
              Your People.<br/>
              Your Opportunities.<br/>
              <span className="text-gradient">Your Connections.</span>
            </h1>
            
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              Meet new people, find love, discover Jobs, post job opportunities, discover opportunities, reconnect with old friends, join communities, and build meaningful connections — all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {profile ? (
                <Link href="/feed" className="neo-button-primary py-4 px-8 text-lg w-full sm:w-auto text-center">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className="neo-button-primary py-4 px-8 text-lg w-full sm:w-auto text-center">
                    Join Rhockstar Connect
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
            <div className="relative rounded-3xl overflow-hidden neo-card border border-white/10 shadow-[0_0_50px_rgba(244,63,94,0.25)] animate-float">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
              <Image 
                src="/images/landing_networking.jpg" 
                alt="Rhockstar Connect Social & Dating Platform" 
                width={1000}
                height={600}
                className="w-full h-auto object-cover opacity-90"
              />
              
              <div className="absolute bottom-6 left-6 right-6 z-20 space-y-3">
                <div className="neo-card p-4 bg-slate-800/90 backdrop-blur-md border-l-4 border-l-rose-500 flex items-center gap-3">
                  <span className="text-2xl">❤️</span>
                  <div>
                    <span className="font-bold text-sm text-white block">New Match Found!</span>
                    <span className="text-xs text-rose-300">You both share an interest in Tech & Music</span>
                  </div>
                </div>
                <div className="neo-card p-4 bg-slate-800/90 backdrop-blur-md border-l-4 border-l-brand flex items-center gap-3 ml-4">
                  <span className="text-xl">💼</span>
                  <div>
                    <span className="font-bold text-sm text-white block">New Job Opportunity</span>
                    <span className="text-xs text-slate-300">Matches your profile skills & preferences</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-32">
          {[
            { label: "Active Members", value: "10K+" },
            { label: "Matches & Connections", value: "25K+" },
            { label: "Jobs & Opportunities", value: "500+" },
            { label: "Public Communities", value: "100+" },
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
            <h2 className="text-4xl font-bold">Everything You Need to Connect, Discover & Grow</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-base">
              Rhockstar Connect brings social networking, dating, jobs, communities, and real-time messaging together in one fluid platform.
            </p>
            <div className="h-1 w-20 bg-gradient-to-r from-rose-500 via-brand to-brand-purple mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: "👥", 
                title: "1. Meet People", 
                desc: "Discover new people, make friends, reconnect with old classmates, and expand your network beyond the people you already know.",
                image: "/images/landing_networking.jpg",
                badge: "Social"
              },
              { 
                icon: "❤️", 
                title: "2. Dating & Matchmaking", 
                desc: "Meet people, discover genuine connections, and find someone you can build a meaningful relationship with. Whether you're looking for friendship, dating, or something serious, connect with people who match your interests.",
                image: "/images/landing_profile.jpg",
                badge: "Dating ❤️"
              },
              { 
                icon: "💼", 
                title: "3. Jobs & Opportunities", 
                desc: "Discover jobs, internships, business opportunities, collaborations, and other opportunities that can help you move forward.",
                image: "/images/landing_job_board.jpg",
                badge: "Careers"
              },
              { 
                icon: "🏫", 
                title: "4. Communities", 
                desc: "Join communities built around schools, careers, industries, sports, hobbies, interests, and everyday conversations.",
                image: "/images/landing_messaging.jpg",
                badge: "Communities"
              },
              { 
                icon: "💬", 
                title: "5. Chat & Connect", 
                desc: "Chat with people, share ideas, start conversations, and stay connected with the people you meet on Rhockstar Connect.",
                image: "/images/landing_feed.jpg",
                badge: "Real-time Chat"
              },
              { 
                icon: "👤", 
                title: "6. Build Your Profile", 
                desc: "Showcase who you are, what you do, your skills, interests, experience, and personality so people can discover and connect with you.",
                image: "/images/landing_profile.jpg",
                badge: "Profile"
              },
              { 
                icon: "📢", 
                title: "7. Share & Discover", 
                desc: "Share your thoughts, experiences, opportunities, and updates while discovering what other people in your network are talking about.",
                image: "/images/landing_security.jpg",
                badge: "Feed"
              },
            ].map((feature, i) => (
              <div key={i} className="neo-card overflow-hidden group hover:border-rose-500/40 transition-all flex flex-col">
                <div className="h-48 w-full relative overflow-hidden bg-slate-800">
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl neo-card bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-xl shadow-lg border border-white/10">
                    {feature.icon}
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full neo-card bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                    {feature.badge}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-brand transition-colors">{feature.title}</h3>
                    <p className="text-slate-300 leading-relaxed text-sm">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="mt-40 neo-card p-8 sm:p-12 bg-slate-900/40 text-center relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold mb-6 text-white">About Rhockstar Connect</h2>
            <div className="space-y-5 text-base sm:text-lg text-slate-300 leading-relaxed">
              <p>
                Rhockstar Connect is a social platform built around people, connections, and opportunities.
              </p>
              <p>
                Whether you&apos;re looking to meet someone, find love, make new friends, reconnect with an old classmate, find a job, discover an opportunity, join a community, chat with people or simply share what&apos;s happening in your world, Rhockstar Connect gives you a place to connect and discover more.
              </p>
              <p className="font-bold text-white text-xl pt-2">
                One platform. More people. More opportunities. More possibilities.
              </p>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="mt-40 mb-20 text-center">
          <div className="neo-card p-12 sm:p-16 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/90 border border-rose-500/30 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white relative z-10">
              Meet People. Find opportunities. Discover More.
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 relative z-10">
              Join Rhockstar Connect and discover the people, communities, relationships, and opportunities waiting for you.
            </p>
            <div className="relative z-10">
              {profile ? (
                <Link href="/feed" className="neo-button-primary py-4 px-10 text-lg shadow-[0_0_40px_rgba(56,189,248,0.4)]">
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/register" className="neo-button-primary py-4 px-10 text-lg shadow-[0_0_40px_rgba(244,63,94,0.4)]">
                  Join Rhockstar Connect
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
          <p className="text-slate-300 mb-8 max-w-md text-sm">Your People. Your Opportunities. Your Connections.</p>
          
          <nav className="flex gap-8 font-medium text-slate-300 mb-12 flex-wrap justify-center">
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

