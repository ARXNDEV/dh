"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [tickerValue, setTickerValue] = useState(1242);
  const [user, setUser] = useState<any>(null);
  const [featuredCharity, setFeaturedCharity] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        }

        const charRes = await fetch('/api/public/charities?featured=true');
        const charData = await charRes.json();
        if (charData.success && charData.data.length > 0) {
          setFeaturedCharity(charData.data[0]);
        }
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    };
    fetchData();

    const interval = setInterval(() => {
      setTickerValue(prev => prev + Math.floor(Math.random() * 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    window.location.reload();
  };

  return (
    <main className="min-h-screen selection:bg-white selection:text-black">
      {/* Aesthetic Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Premium Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-black/20 backdrop-blur-3xl border-b border-white/5 px-8 py-4 flex justify-between items-center transition-all duration-500 hover:bg-black/40">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-all duration-700">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Logo Container */}
            <div className="relative w-full h-full bg-gradient-to-br from-white to-silver-100 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 overflow-hidden">
              <svg className="w-6 h-6 text-black relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 8V16L12 20L20 16V8L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 10L12 16L16 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
              </svg>
              {/* Internal Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </div>
          <div>
            <span className="text-2xl font-black tracking-[-0.08em] uppercase italic block leading-none text-glow-indigo">VALOR</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.4em] block">Legacy Collective</span>
              <div className="w-1 h-1 rounded-full bg-white/20"></div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-white/40 tabular-nums uppercase tracking-widest">{tickerValue.toLocaleString()} LIVES TOUCHED</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-center">
          <div className="hidden lg:flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <Link href="/charities" className="hover:text-indigo-400 transition-colors">Directory</Link>
            <Link href="/mission" className="hover:text-indigo-400 transition-colors">Mission</Link>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="btn-indigo py-2 px-5 text-[9px]">Dashboard</Link>
              <button onClick={handleLogout} className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-rose-500 transition-colors">Disconnect</button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/auth/login" className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Login</Link>
              <Link href="/auth/signup" className="btn-indigo py-2.5 px-6 text-[10px]">Join Mission</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-8 overflow-hidden">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 italic">Humanitarian Orchestration Live</span>
            </div>
            
            <h1 className="text-7xl lg:text-[120px] font-black italic uppercase leading-[0.85] tracking-tighter mb-12 animate-slot-in">
              Impact <span className="text-glow-white">driven by</span> <br />
              <span className="text-indigo-500">Performance</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/40 font-bold uppercase tracking-tight mb-16 max-w-2xl leading-tight animate-fade-in animation-delay-200">
              VALOR is a global collective where high-performance golf rounds are orchestrated into humanitarian results. Subscribe, play, and contribute to world-changing causes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 animate-fade-in animation-delay-400">
              <Link href="/auth/signup" className="btn-indigo px-12 py-6 text-sm group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-3 italic">
                  Initiate Legacy Node
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </span>
              </Link>
              <Link href="/charities" className="px-12 py-6 rounded-2xl bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all text-center">
                Explore Grid
              </Link>
            </div>
          </div>
        </div>

        {/* Global Impact Ticker */}
        <div className="absolute bottom-0 left-0 w-full bg-indigo-500 py-4 overflow-hidden whitespace-nowrap border-y border-white/10">
          <div className="flex animate-marquee">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-12 mx-12">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black italic">Total Collective Impact: ${tickerValue.toLocaleString()}.00</span>
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black italic">Active Heroes: 842</span>
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-[1400px] mx-auto px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="glass-panel p-10 group hover:border-indigo-500/30 transition-all duration-700">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-8 group-hover:bg-indigo-500 transition-colors">
              <span className="text-xl font-black italic">01</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Select Your Cause</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-loose">Choose a humanitarian node to support. 10% of every subscription fee is orchestrated directly to your selected charity.</p>
          </div>
          <div className="glass-panel p-10 group hover:border-indigo-500/30 transition-all duration-700">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-8 group-hover:bg-indigo-500 transition-colors">
              <span className="text-xl font-black italic">02</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Log Your Rounds</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-loose">Enter your high-performance Stableford scores. Our engine maintains your rolling 5-round average to determine eligibility.</p>
          </div>
          <div className="glass-panel p-10 group hover:border-indigo-500/30 transition-all duration-700">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-8 group-hover:bg-indigo-500 transition-colors">
              <span className="text-xl font-black italic">03</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Win & Reinvest</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-loose">Participate in monthly draws. Match your performance with the collective results to win prizes and reinvest in humanitarian impact.</p>
          </div>
        </div>
      </section>

      {/* Impact Stats: Emotion-Driven */}
      <section className="py-32 px-8 max-w-7xl mx-auto z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Total Contributions', value: '$1.2M+', sub: 'Directly to Charities', color: 'indigo' },
            { label: 'Communities Reached', value: '482', sub: 'Global Scale', color: 'indigo' },
            { label: 'Active Heroes', value: '12,000+', sub: 'Playing with Purpose', color: 'indigo' }
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-12 text-center group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent`}></div>
              <div className="text-6xl font-black tracking-tighter mb-4 group-hover:scale-110 transition-transform duration-700 italic text-glow-indigo">{stat.value}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-3">{stat.label}</div>
              <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Charity Spotlight: Emotion-Driven Card */}
      <section className="py-32 px-8 max-w-7xl mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16">
          <div>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-4 block italic">The Collective</span>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9]">Human <span className="text-white/10">Orchestration</span></h2>
          </div>
          <Link href="/charities" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-indigo-400 transition-all border-b border-white/5 pb-3">Explore Directory</Link>
        </div>

        <div className="glass-panel p-1.5 w-full overflow-hidden hover:scale-[1.005] transition-transform duration-1000">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-[400px] lg:h-auto overflow-hidden rounded-[34px]">
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
                alt="Charity Impact" 
                className="w-full h-full object-cover grayscale brightness-50 hover:grayscale-0 hover:brightness-100 transition-all duration-[2000ms] scale-110 hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-transparent hidden lg:block"></div>
            </div>
            <div className="p-12 lg:p-20 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
                <span className="text-xl font-black uppercase italic tracking-tighter">Clean Water Initiative</span>
              </div>
              <h3 className="text-3xl font-black mb-8 leading-[1.1] uppercase tracking-tighter">Engineering <span className="text-indigo-500">Life</span> into thirsty communities.</h3>
              <p className="text-white/30 text-lg mb-12 font-medium leading-[1.6] tracking-tight">
                Your performance isn't just a number on a card. It's the technical fuel behind sustainable water systems, providing over 10,000 souls with pure, life-saving hydration.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/auth/signup" className="btn-indigo py-4 px-10 text-[11px]">Join The Cause</Link>
                <button className="px-8 py-4 rounded-2xl border border-white/5 font-black text-[9px] uppercase tracking-[0.3em] hover:bg-white/5 hover:border-white/20 transition-all text-white/30 hover:text-white">Direct Donation</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Winnings Visualization: Shimmer Effect */}
      <section className="py-24 px-8 max-w-7xl mx-auto text-center border-y border-white/5">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          The Reward Engine
        </div>
        <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-10">
          Monthly <span className="shimmer text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-silver-500">Jackpot</span>
        </h2>
        <div className="text-8xl md:text-[140px] font-black tracking-tighter tabular-nums mb-12 leading-none italic bg-white/5 py-10 rounded-[48px] border border-white/5 shimmer text-glow-indigo">
          $12,500
        </div>
        <p className="text-lg text-white/40 font-medium max-w-xl mx-auto mb-12">
          Every active subscriber is automatically entered into the 5-number match draw. 40% of the monthly pool rolls over if the jackpot remains unclaimed.
        </p>
        <Link href="/auth/signup" className="btn-indigo py-5 px-14 text-sm italic shadow-2xl shadow-indigo-500/5">Join The Next Draw</Link>
      </section>

      {/* Spotlight Charity Section */}
      {featuredCharity && (
        <section className="max-w-[1400px] mx-auto px-8 py-32">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Spotlight Cause</h2>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>
          
          <div className="glass-panel overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="h-[500px] relative overflow-hidden">
              <img src={featuredCharity.image} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt={featuredCharity.name} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
            </div>
            <div className="p-12 lg:p-20 flex flex-col justify-center">
              <span className="px-4 py-1.5 bg-indigo-500 rounded-full text-[8px] font-black uppercase tracking-widest mb-8 w-fit shadow-lg">{featuredCharity.category}</span>
              <h3 className="text-5xl font-black italic uppercase tracking-tighter mb-6">{featuredCharity.name}</h3>
              <p className="text-white/40 text-[11px] font-black uppercase tracking-widest leading-loose mb-12">{featuredCharity.impact}</p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href={`/charities/${featuredCharity._id}`} className="btn-indigo px-10 py-5 text-[10px] text-center">View Node Profile</Link>
                <Link href="/charities" className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-center">Explore Directory</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-black italic">V</div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">VALOR Platform</span>
            </div>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">A World-Class Impact SaaS © 2026</p>
          </div>
          <div className="flex gap-10 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
            <a href="#" className="hover:text-indigo-400 transition-colors">Architecture</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">API Console</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
