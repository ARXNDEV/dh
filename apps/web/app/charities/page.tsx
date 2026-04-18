"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CharityDirectory() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Humanitarian', 'Environment', 'Education', 'Technology'];

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/charities?search=${search}&category=${category}`);
      const json = await res.json();
      if (json.success) setCharities(json.data);
    } catch (err) {
      console.error('Fetch charities failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCharities();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-black/50 backdrop-blur-2xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-4 group">
          <span className="text-xl font-black tracking-[-0.05em] uppercase italic text-glow-indigo">VALOR <span className="text-white/40">Charity</span></span>
        </Link>
        <Link href="/auth/login" className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Sign In</Link>
      </nav>

      <section className="max-w-[1400px] mx-auto px-8 pt-32 pb-24">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-6">Global <span className="text-indigo-500">Directory</span></h1>
          <p className="text-white/40 max-w-2xl mx-auto uppercase tracking-widest text-[10px] font-black leading-loose">Explore the humanitarian nodes orchestrated by the VALOR collective. Every high-performance round contributes to these global causes.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search Causes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500/50 transition-all font-bold"
            />
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-24 text-center text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Scanning Impact Grid...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {charities.map((charity) => (
              <Link 
                key={charity._id} 
                href={`/charities/${charity._id}`}
                className="glass-panel group overflow-hidden relative block"
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={charity.image} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                    alt={charity.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <span className="px-3 py-1 bg-indigo-500 rounded-full text-[8px] font-black uppercase tracking-widest mb-3 inline-block shadow-lg">{charity.category}</span>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{charity.name}</h3>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed mb-8 line-clamp-2">{charity.impact}</p>
                  <div className="flex justify-between items-center border-t border-white/5 pt-6">
                    <div>
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Total Impact</p>
                      <p className="text-lg font-black text-rose-500 italic tabular-nums">${charity.totalContributions.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-all duration-500">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
