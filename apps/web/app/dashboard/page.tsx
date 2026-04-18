"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const INITIAL_SCORES = [
  { id: '1', points: 38, date: '2026-04-10' },
  { id: '2', points: 35, date: '2026-04-08' },
  { id: '3', points: 42, date: '2026-04-05' },
  { id: '4', points: 36, date: '2026-04-01' },
  { id: '5', points: 40, date: '2026-03-28' },
];

export default function DashboardPage() {
  const [scores, setScores] = useState<any[]>([]);
  const [newScore, setNewScore] = useState(36);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [updatingDonation, setUpdatingDonation] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [winnings, setWinnings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchScores = async (userId: string) => {
    try {
      const res = await fetch(`/api/scores?userId=${userId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setScores(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch scores:', err);
    }
  };

  const fetchWinnings = async (userId: string) => {
    try {
      const res = await fetch(`/api/auth/profile?id=${userId}`);
      const profileData = await res.json();
      if (profileData.success) {
        // In a real scenario, we'd have a specific endpoint for user winnings
        // For now, we'll fetch from the winners list if available
        const winnersRes = await fetch('/api/admin/winners');
        const winnersData = await winnersRes.json();
        if (winnersData.success) {
          const userWinnings = winnersData.data.filter((w: any) => w.userId?._id === userId);
          setWinnings(userWinnings);
        }
      }
    } catch (err) {
      console.error('Failed to fetch winnings:', err);
    }
  };

  const updateDonationPercentage = async (newPercentage: number) => {
    setUpdatingDonation(true);
    try {
      const res = await fetch('/api/user/donation-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationPercentage: newPercentage })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setSuccess(`Donation percentage optimized to ${newPercentage}%`);
      }
    } catch (err) {
      console.error('Failed to update donation percentage:', err);
    } finally {
      setUpdatingDonation(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          const profileRes = await fetch(`/api/auth/profile?id=${data.user.id}`);
          const profileData = await profileRes.json();
          if (profileData.success) {
            setProfile(profileData.user);
            fetchScores(profileData.user._id);
            fetchWinnings(profileData.user._id);
          }
        } else {
          window.location.href = '/auth/login';
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile._id,
          score: newScore,
          date: newDate
        })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        setSuccess(data.message);
        await fetchScores(profile._id);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    window.location.href = '/auth/login';
  };

  const handleEditScore = async (scoreId: string, currentPoints: number) => {
    const newPoints = prompt("Enter new points (1-45):", currentPoints.toString());
    if (newPoints && parseInt(newPoints) !== currentPoints) {
      try {
        const res = await fetch('/api/scores', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scoreId, points: parseInt(newPoints) })
        });
        const data = await res.json();
        if (data.status === 'success') {
          setSuccess("Score updated successfully.");
          fetchScores(profile._id);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error('Edit failed:', err);
      }
    }
  };

  const handleDeleteScore = async (scoreId: string) => {
    if (confirm("Are you sure you want to delete this round? This will affect your rolling average.")) {
      try {
        const res = await fetch(`/api/scores?id=${scoreId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.status === 'success') {
          setSuccess("Score deleted successfully.");
          fetchScores(profile._id);
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handlePortal = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to launch portal:', err);
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
          <span className="text-xl font-black tracking-[-0.05em] uppercase italic text-glow-indigo">VALOR <span className="text-white/40">Collective</span></span>
        </div>
        <div className="flex items-center gap-8">
          {profile?.role === 'admin' && (
            <Link href="/admin" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">Admin Nexus</Link>
          )}
          <div className="text-right hidden md:block">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Authenticated Hero</p>
            <p className="text-[11px] font-black text-indigo-500 uppercase italic">{profile?.fullName || user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Score Entry & Rolling Visual */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Rolling 5 Slot Visual */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tight">Rolling <span className="text-indigo-500">5</span> Logic</h2>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-1">Stitch Engine: Oldest entry prunes automatically</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Protocol Active</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {scores.map((s, i) => (
                  <div 
                    key={s._id || s.id} 
                    className={`glass-panel p-5 text-center relative overflow-hidden animate-slot-in group`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors"></div>
                    {i === 4 && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/50"></div>}
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 relative z-10">Round {i + 1}</div>
                    <div className="text-3xl font-black tracking-tighter mb-2 italic tabular-nums relative z-10">{s.points}</div>
                    <div className="text-[8px] font-bold text-white/40 uppercase tracking-wider relative z-10">{s.date}</div>
                    
                    <div className="mt-4 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
                      <button onClick={() => handleEditScore(s._id || s.id, s.points)} className="text-[8px] font-black uppercase tracking-widest text-indigo-400 hover:text-white">Edit</button>
                      <button onClick={() => handleDeleteScore(s._id || s.id)} className="text-[8px] font-black uppercase tracking-widest text-rose-500 hover:text-white">Delete</button>
                    </div>

                    {i === scores.length - 1 && scores.length === 5 && (
                      <div className="mt-3 pt-3 border-t border-white/5 text-[8px] font-black text-rose-500 uppercase tracking-widest relative z-10">Prune Target</div>
                    )}
                  </div>
                ))}
                {Array.from({ length: 5 - scores.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="glass-panel p-5 text-center border-dashed border-white/5 opacity-20">
                    <div className="text-[9px] font-black uppercase tracking-widest mb-3 italic">Slot {scores.length + i + 1}</div>
                    <div className="text-3xl font-black tracking-tighter mb-2 italic tabular-nums">--</div>
                    <div className="text-[8px] font-bold uppercase tracking-wider">Empty</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Winnings & Participation Section */}
            {winnings.length > 0 && (
              <div className="glass-panel p-8 relative overflow-hidden bg-emerald-500/5 border-emerald-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"></div>
                <h3 className="text-xl font-black mb-6 italic uppercase tracking-tight text-glow-emerald">Active <span className="text-emerald-500">Winnings</span></h3>
                <div className="space-y-4">
                  {winnings.map((win: any) => (
                    <div key={win._id} className="flex justify-between items-center p-6 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{win.monthYear} Prize</p>
                        <p className="text-2xl font-black italic text-emerald-500 tabular-nums">${win.prizeAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest mb-2">Status: {win.verificationStatus}</p>
                        {win.verificationStatus === 'Pending' && !win.proofUrl && (
                          <button 
                            onClick={() => {
                              const proof = prompt("Please enter the URL of your score proof (e.g., Stableford Screenshot):");
                              if (proof) {
                                fetch('/api/winners/verify', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ winnerId: win._id, proofUrl: proof })
                                }).then(() => fetchWinnings(profile._id));
                              }
                            }}
                            className="px-6 py-2 bg-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-black"
                          >
                            Upload Proof
                          </button>
                        )}
                        {win.proofUrl && (
                          <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Proof Submitted</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participation & Upcoming Draws */}
            <div className="glass-panel p-8 relative overflow-hidden bg-white/[0.02]">
              <h3 className="text-xl font-black mb-6 italic uppercase tracking-tight">Collective <span className="text-indigo-500">Participation</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4">Historical Entries</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-white/40">March 2026 Draw</span>
                      <span className="text-emerald-500">Confirmed</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <span className="text-white/40">February 2026 Draw</span>
                      <span className="text-white/20">Archived</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">Next Orchestration</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xl font-black italic uppercase tracking-tight">April 2026 Cycle</p>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">Status: Active Distribution</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-indigo-500 italic tabular-nums">12 Days Left</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Entry Form */}
            <div className="glass-panel p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full"></div>
              <h3 className="text-xl font-black mb-6 italic uppercase tracking-tight text-glow-indigo">Log <span className="text-indigo-500">Round</span></h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Stableford Points</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="45"
                    value={newScore}
                    onChange={(e) => setNewScore(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-black text-xl outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Play Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-bold text-sm outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-indigo py-4 disabled:opacity-50 text-[11px]"
                >
                  {loading ? "Syncing..." : "Commit Score"}
                </button>
              </form>
              {error && (
                <div className="mt-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-[9px] font-black uppercase tracking-widest text-center animate-pulse">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-[9px] font-black uppercase tracking-widest text-center">
                  {success}
                </div>
              )}
            </div>

            {/* Winner's Circle: Proof Upload */}
            <div className="glass-panel p-8 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight">Winner's <span className="text-indigo-400">Circle</span></h3>
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-1">Pending Verification for Round: April 10</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">Pending Payout</span>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 w-full p-6 border-2 border-dashed border-white/10 rounded-[28px] flex flex-col items-center justify-center group-hover:border-indigo-500/30 transition-all cursor-pointer">
                  <svg className="w-8 h-8 text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Upload Score Screenshot</p>
                </div>
                <div className="w-full md:w-64">
                  <p className="text-[11px] text-white/40 mb-4 font-medium leading-relaxed">To claim your <span className="text-white font-bold">$4,200</span> prize, please upload a valid screenshot from your golf performance app.</p>
                  <button className="w-full py-3.5 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-indigo-50 transition-all">Submit for Review</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Impact Ticker & Draw Card */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Impact Ticker */}
            <div className="glass-panel p-8 relative overflow-hidden bg-indigo-500/5 border-indigo-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full"></div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black italic uppercase tracking-tight text-glow-indigo">Impact <span className="text-indigo-500">Node</span></h3>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${profile?.subscriptionStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500 animate-pulse'}`}>
                    {profile?.subscriptionStatus || 'Inactive'}
                  </span>
                  <button 
                    onClick={handlePortal}
                    className="text-[8px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Manage Subscription
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1.5">Primary Charity</p>
                  <p className="text-base font-black uppercase tracking-tight italic">
                    {profile?.charityId === '1' ? 'Clean Water Initiative' : 
                     profile?.charityId === '2' ? 'Tech for All' : 
                     profile?.charityId === '3' ? 'Green Canopy' : 'No Charity Selected'}
                  </p>
                  <Link href="/charities" className="text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors mt-2 inline-block">Change Primary Node</Link>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 relative group">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Contribution</p>
                    <p className="text-lg font-black text-rose-500">{profile?.donationPercentage || 10}% <span className="text-[9px] opacity-40 uppercase">MIN</span></p>
                    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl">
                      <button onClick={() => updateDonationPercentage((profile?.donationPercentage || 10) + 5)} className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-xs font-black">+</button>
                      <button onClick={() => updateDonationPercentage(Math.max(10, (profile?.donationPercentage || 10) - 5))} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-xs font-black">-</button>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Total Good</p>
                    <p className="text-lg font-black text-rose-500">${profile?.totalDonated?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                <Link href={profile?.charityId ? `/charities/${profile.charityId}` : '/charities'} className="btn-indigo w-full py-4 text-[9px] text-center italic">Make Independent Donation</Link>

                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                    <span>Impact Progress</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[75%] shadow-[0_0_10px_rgba(225,29,72,0.5)]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Draw Participation Card */}
            <div className="glass-panel p-6 bg-gradient-to-br from-indigo-600/20 to-indigo-900/40 border-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/40"></div>
                </div>
              </div>

              <h3 className="text-lg font-black uppercase italic tracking-tight mb-6">Draw <span className="text-indigo-400">Status</span></h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Upcoming Jackpot</p>
                  <div className="text-4xl font-black tracking-tighter italic shimmer text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-white">$12,500</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-white/40">Next Draw Date</span>
                    <span className="text-indigo-400">May 01, 2026</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-white/40">Your Entries</span>
                    <span className="text-indigo-400 italic">5 Registered</span>
                  </div>
                </div>

                <button className="w-full py-3.5 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-indigo-50 transition-all">View Draw Mechanics</button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/5 text-center">
        <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">VALOR Impact Dashboard v1.0</p>
      </footer>
    </main>
  );
}
