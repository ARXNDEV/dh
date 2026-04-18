"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [view, setView] = useState<'winners' | 'users' | 'draws' | 'charities' | 'analytics'>('winners');
  const [drawType, setDrawType] = useState<'Random' | 'Algorithmic'>('Random');
  const [data, setData] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);
  const router = useRouter();

  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const res = await fetch('/api/mcp/draw_engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthYear: 'April 2026',
          drawType,
          action: 'simulate'
        })
      });
      const json = await res.json();
      setSimResult(json.data);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const publishDraw = async () => {
    try {
      const res = await fetch('/api/mcp/draw_engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthYear: 'April 2026',
          drawType,
          action: 'publish'
        })
      });
      const json = await res.json();
      alert(json.message);
      setSimResult(null);
      fetchViewData('draws');
    } catch (err) {
      console.error('Publish failed:', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        if (!session.authenticated || session.user.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setUser(session.user);
        fetchAnalytics();
        fetchViewData('winners');
      } catch (err) {
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const json = await res.json();
      if (json.success) setAnalytics(json.data);
    } catch (err) {
      console.error('Analytics fetch failed:', err);
    }
  };

  const fetchViewData = async (targetView: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${targetView}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(`Fetch for ${targetView} failed:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newView: any) => {
    setView(newView);
    if (newView !== 'analytics') {
      fetchViewData(newView);
    }
  };

  const handleAddCharity = async () => {
    const name = prompt("Charity Name:");
    const impact = prompt("Impact Statement:");
    const image = prompt("Image URL:", "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846");
    const category = prompt("Category (Humanitarian/Environment/etc):", "Humanitarian");
    
    if (name && impact && image) {
      try {
        await fetch('/api/admin/charities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, impact, image, category })
        });
        fetchViewData('charities');
      } catch (err) {
        console.error('Add charity failed:', err);
      }
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-black/50 backdrop-blur-2xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative w-9 h-9 flex items-center justify-center group-hover:scale-110 transition-all duration-700">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-white to-silver-100 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 overflow-hidden">
              <svg className="w-5 h-5 text-black relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 8V16L12 20L20 16V8L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 10L12 16L16 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-black tracking-[-0.05em] uppercase italic text-glow-indigo">VALOR <span className="text-white/40">Nexus</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Admin: {user.fullName}</span>
          <Link href="/" className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Exit</Link>
        </div>
      </nav>

      <section className="max-w-[1600px] mx-auto px-8 pt-24 pb-16">
        
        {/* Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-6">
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1.5">Total Impact</div>
            <div className="text-3xl font-black italic tabular-nums text-rose-500">${analytics?.totalDonated?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="glass-panel p-6">
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1.5">Active Heroes</div>
            <div className="text-3xl font-black italic tabular-nums text-[#6366f1]">{analytics?.totalUsers || '0'}</div>
          </div>
          <div className="glass-panel p-6">
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1.5">Recent Rounds (30d)</div>
            <div className="text-3xl font-black italic tabular-nums text-indigo-400">{analytics?.recentScores30Days || '0'}</div>
          </div>
          <div className="glass-panel p-6">
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1.5">Charities Supported</div>
            <div className="text-3xl font-black italic tabular-nums text-amber-500">{analytics?.charityStats?.length || '0'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Sidebar: Tabs */}
          <div className="lg:col-span-2 space-y-3">
            {[
              { id: 'winners', label: 'Winners', icon: 'M5 13l4 4L19 7' },
              { id: 'users', label: 'Users', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'charities', label: 'Charities', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
              { id: 'draws', label: 'Draws', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full p-3.5 rounded-xl flex items-center gap-3 text-left transition-all ${view === tab.id ? 'bg-[#6366f1] text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}/></svg>
                <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right: Data Table */}
          <div className="lg:col-span-10">
            <div className="glass-panel overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-black uppercase italic tracking-tight">{view}</h3>
                <div className="flex gap-3">
                  {view === 'charities' && (
                    <button 
                      onClick={handleAddCharity}
                      className="px-4 py-2 bg-indigo-500 rounded-lg text-[9px] font-black uppercase tracking-widest"
                    >
                      + Add Charity
                    </button>
                  )}
                  <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10">Export CSV</button>
                </div>
              </div>

              {view === 'draws' && (
                <div className="p-8 border-b border-white/5 bg-indigo-500/5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h4 className="text-xl font-black italic uppercase tracking-tight mb-2">Monthly Draw <span className="text-indigo-500">Engine</span></h4>
                      <div className="flex gap-4 mt-4">
                        <button 
                          onClick={() => setDrawType('Random')}
                          className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${drawType === 'Random' ? 'bg-indigo-500 text-white' : 'bg-white/5 border border-white/10'}`}
                        >
                          Random Mode
                        </button>
                        <button 
                          onClick={() => setDrawType('Algorithmic')}
                          className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${drawType === 'Algorithmic' ? 'bg-indigo-500 text-white' : 'bg-white/5 border border-white/10'}`}
                        >
                          Algorithmic Mode
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={runSimulation}
                        disabled={simLoading}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        {simLoading ? "Simulating..." : "Run Simulation"}
                      </button>
                      <button 
                        onClick={publishDraw}
                        disabled={!simResult}
                        className="btn-indigo px-8 py-3 disabled:opacity-30"
                      >
                        Publish Results
                      </button>
                    </div>
                  </div>

                  {simResult && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slot-in">
                      <div className="glass-panel p-5 border-indigo-500/30">
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Pool Estimate</div>
                        <div className="text-2xl font-black italic text-indigo-500 tabular-nums">${simResult.totalPool.toLocaleString()}</div>
                      </div>
                      <div className="glass-panel p-5 border-indigo-500/30">
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Jackpot Status</div>
                        <div className="text-2xl font-black italic text-rose-500 tabular-nums">
                          {simResult.winnersCount.match5 > 0 ? `$${simResult.prizeSplits.match5.toLocaleString()}` : `Rollover: $${simResult.jackpotRollover.toLocaleString()}`}
                        </div>
                      </div>
                      <div className="glass-panel p-5 border-indigo-500/30">
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Winning Numbers</div>
                        <div className="text-2xl font-black italic text-amber-500 tabular-nums">{simResult.winningNumbers.join(' • ')}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {loading ? (
                <div className="p-20 text-center text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] bg-white/[0.02]">
                        {view === 'users' && (
                          <>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Impact</th>
                            <th className="px-6 py-4">Actions</th>
                          </>
                        )}
                        {view === 'winners' && (
                          <>
                            <th className="px-6 py-4">Winner</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Month</th>
                            <th className="px-6 py-4">Actions</th>
                          </>
                        )}
                        {view === 'charities' && (
                          <>
                            <th className="px-6 py-4">Charity Name</th>
                            <th className="px-6 py-4">Total Raised</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4">Actions</th>
                          </>
                        )}
                        {view === 'draws' && (
                          <>
                            <th className="px-6 py-4">Month/Year</th>
                            <th className="px-6 py-4">Total Pool</th>
                            <th className="px-6 py-4">Rollover</th>
                            <th className="px-6 py-4">Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.map((item: any) => (
                        <tr key={item._id} className="hover:bg-white/[0.01] transition-colors">
                          {view === 'draws' && (
                            <>
                              <td className="px-6 py-4 font-bold text-sm italic">{item.monthYear}</td>
                              <td className="px-6 py-4 font-black text-xs text-indigo-400">${item.totalPool.toLocaleString()}</td>
                              <td className="px-6 py-4 font-black text-xs text-rose-500">${item.jackpotRollover.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${item.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                  {item.status}
                                </span>
                              </td>
                            </>
                          )}
                          {view === 'users' && (
                            <>
                              <td className="px-6 py-4 font-bold text-sm italic">{item.fullName}</td>
                              <td className="px-6 py-4 text-[11px] text-white/40">{item.email}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${item.subscriptionStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                  {item.subscriptionStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-black text-xs text-rose-500">${item.totalDonated.toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => {
                                      const newName = prompt("Edit Full Name:", item.fullName);
                                      if (newName) fetch('/api/admin/users', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: item._id, fullName: newName })
                                      }).then(() => fetchViewData('users'));
                                    }}
                                    className="text-[9px] font-black uppercase text-indigo-400 hover:text-white transition-colors"
                                  >
                                    Edit Profile
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      const res = await fetch(`/api/scores?userId=${item._id}`);
                                      const json = await res.json();
                                      if (json.status === 'success' && json.data.length > 0) {
                                        const score = json.data[0];
                                        const newPts = prompt(`Edit latest score (${score.date}):`, score.points);
                                        if (newPts) fetch('/api/scores', {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ scoreId: score._id, points: parseInt(newPts) })
                                        }).then(() => alert('Score orchestrated.'));
                                      } else {
                                        alert('No scores found for this Hero.');
                                      }
                                    }}
                                    className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors"
                                  >
                                    Edit Scores
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const newStatus = item.subscriptionStatus === 'active' ? 'inactive' : 'active';
                                      if (confirm(`Toggle subscription to ${newStatus}?`)) fetch('/api/admin/users', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ id: item._id, subscriptionStatus: newStatus })
                                      }).then(() => fetchViewData('users'));
                                    }}
                                    className="text-[9px] font-black uppercase text-amber-500 hover:text-white transition-colors"
                                  >
                                    Toggle Sub
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                          {view === 'winners' && (
                            <>
                              <td className="px-6 py-4 font-bold text-sm italic">{item.userId?.fullName || 'Unknown'}</td>
                              <td className="px-6 py-4 font-black text-xs text-[#6366f1]">${item.prizeAmount}</td>
                              <td className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">{item.verificationStatus}</td>
                              <td className="px-6 py-4 text-[11px] text-white/40">{item.monthYear}</td>
                              <td className="px-6 py-4">
                                <div className="flex gap-3">
                                  {item.verificationStatus === 'Pending' && (
                                    <>
                                      <button 
                                        onClick={() => fetch('/api/winners/approve', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ winnerId: item._id, status: 'Approved', adminNotes: 'Verified by Admin' })
                                        }).then(() => fetchViewData('winners'))}
                                        className="text-[9px] font-black uppercase text-emerald-500 hover:text-white transition-colors"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => fetch('/api/winners/approve', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ winnerId: item._id, status: 'Rejected', adminNotes: 'Invalid proof' })
                                        }).then(() => fetchViewData('winners'))}
                                        className="text-[9px] font-black uppercase text-rose-500 hover:text-white transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {item.verificationStatus === 'Approved' && !item.paidAt && (
                                    <button 
                                      onClick={() => fetch('/api/winners/approve', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ winnerId: item._id, status: 'Approved', adminNotes: 'Payout Complete' })
                                      }).then(() => fetchViewData('winners'))}
                                      className="text-[9px] font-black uppercase text-indigo-400 hover:text-white transition-colors"
                                    >
                                      Mark Paid
                                    </button>
                                  )}
                                  {item.paidAt && <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Paid</span>}
                                </div>
                              </td>
                            </>
                          )}
                          {view === 'charities' && (
                            <>
                              <td className="px-6 py-4 font-bold text-sm italic">{item.name}</td>
                              <td className="px-6 py-4 font-black text-xs text-amber-500">${item.totalContributions.toFixed(2)}</td>
                              <td className="px-6 py-4 text-[11px] text-white/40">{new Date(item.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4 flex gap-3">
                                <button className="text-[9px] font-black uppercase text-indigo-400">Edit</button>
                                <button className="text-[9px] font-black uppercase text-rose-500">Delete</button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
