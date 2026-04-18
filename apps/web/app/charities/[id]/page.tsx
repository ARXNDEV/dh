"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CharityProfile() {
  const { id } = useParams();
  const [charity, setCharity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [donationAmount, setDonationAmount] = useState(25);
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Charity
        const charRes = await fetch(`/api/public/charities`);
        const charJson = await charRes.json();
        if (charJson.success) {
          const found = charJson.data.find((c: any) => c._id === id);
          setCharity(found);
        }

        // Fetch User Session
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        if (session.authenticated) setUser(session.user);
      } catch (err) {
        console.error('Fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDonate = async () => {
    setDonating(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: id,
          amount: donationAmount,
          userId: user?.id
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        window.location.reload();
      }
    } catch (err) {
      console.error('Donation failed:', err);
    } finally {
      setDonating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Accessing Node Profile...</div>;
  if (!charity) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Charity not found.</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      {/* Hero Header */}
      <div className="relative h-[60vh] overflow-hidden">
        <img src={charity.image} className="w-full h-full object-cover grayscale opacity-40" alt={charity.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-12 lg:p-24">
          <div className="max-w-[1400px] mx-auto">
            <Link href="/charities" className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-8 inline-block hover:text-white transition-colors">← Back to Directory</Link>
            <span className="px-4 py-1.5 bg-indigo-500 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 block w-fit shadow-lg">{charity.category}</span>
            <h1 className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter mb-4 text-glow-white">{charity.name}</h1>
            <p className="text-xl font-bold text-white/60 italic uppercase tracking-tight max-w-3xl">{charity.impact}</p>
          </div>
        </div>
      </div>

      <section className="max-w-[1400px] mx-auto px-8 lg:px-24 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          
          {/* Left: Content */}
          <div className="lg:col-span-8 space-y-16">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-8">Humanitarian Mission</h2>
              <p className="text-lg text-white/40 leading-relaxed uppercase tracking-wide font-medium">
                {charity.description || "The VALOR Collective has identified this node as a critical humanitarian priority. By orchestrating high-performance rounds through our impact engine, users directly contribute to the stabilization and growth of this cause. Our commitment is rooted in data-driven results and transparent orchestration."}
              </p>
            </div>

            {/* Gallery */}
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-8">Visual Impact</h2>
              <div className="grid grid-cols-2 gap-4">
                {(charity.gallery?.length > 0 ? charity.gallery : [charity.image, charity.image]).map((img: string, i: number) => (
                  <div key={i} className="aspect-video rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                    <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" alt="Gallery" />
                  </div>
                ))}
              </div>
            </div>

            {/* Events */}
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-8">Upcoming Events</h2>
              <div className="space-y-4">
                {(charity.upcomingEvents?.length > 0 ? charity.upcomingEvents : [
                  { title: "VALOR Principal Golf Day", date: "June 12, 2026", description: "A high-performance tournament dedicated to node stabilization." },
                  { title: "Impact Orchestration Gala", date: "August 05, 2026", description: "Annual celebration of the collective's humanitarian achievements." }
                ]).map((event: any, i: number) => (
                  <div key={i} className="glass-panel p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-indigo-500/30 transition-all">
                    <div>
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">{event.date}</span>
                      <h4 className="text-xl font-black italic uppercase tracking-tight">{event.title}</h4>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">{event.description}</p>
                    </div>
                    <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-indigo-500 transition-all">Register Interest</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar Actions */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-panel p-8 sticky top-32 border-indigo-500/20 bg-indigo-500/5">
              <h3 className="text-xl font-black italic uppercase tracking-tight mb-8 text-center">Independent <span className="text-indigo-500">Donation</span></h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setDonationAmount(amt)}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all ${donationAmount === amt ? 'bg-indigo-500 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                
                <input 
                  type="number" 
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 font-black text-2xl text-center outline-none focus:border-indigo-500/50 transition-all tabular-nums"
                  placeholder="Custom Amount"
                />

                <button 
                  onClick={handleDonate}
                  disabled={donating}
                  className="btn-indigo w-full py-5 text-[11px] italic font-black shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]"
                >
                  {donating ? "SYNCHRONIZING..." : "EXECUTE DONATION"}
                </button>

                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-center leading-loose">
                  Independent donations are not tied to golf performance. 100% of these funds are orchestrated directly to the cause.
                </p>
              </div>

              <div className="mt-12 pt-12 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Total Contributions</p>
                <p className="text-4xl font-black italic text-rose-500 tabular-nums">${charity.totalContributions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
