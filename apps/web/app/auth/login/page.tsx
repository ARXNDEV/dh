"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("Google authentication is currently being re-orchestrated for MongoDB. Please use your credentials.");
  };

  return (
    <main className="min-h-screen bg-[#020202] text-white flex flex-col lg:flex-row font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Left Side: Cinematic Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-24 border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1593344484962-796055d4a3a4?q=80&w=2030&auto=format&fit=crop" 
            alt="VALOR Architecture" 
            className="w-full h-full object-cover opacity-20 grayscale brightness-50 scale-110 animate-pulse"
            style={{ animationDuration: '8s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-[#020202]/80 to-[#020202]"></div>
        </div>
        
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-indigo-400 text-[9px] font-black uppercase tracking-[0.4em] mb-12">
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping"></div>
            Legacy Protocol v4.0
          </div>
          <h2 className="text-7xl font-black italic uppercase tracking-[-0.05em] leading-[0.85] mb-8 text-glow-indigo">
            RESUME<br/>
            <span className="text-white/10">THE</span><br/>
            MISSION.
          </h2>
          <p className="text-xl text-white/30 font-medium leading-relaxed tracking-tight">
            Your performance continues to fuel the global collective. Access the Nexus to manage your impact and analyze your legacy.
          </p>
        </div>

        {/* Floating Technical Elements */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end opacity-20">
          <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">Global Nodes</p>
            <p className="text-xl font-black tabular-nums italic">1,242.00</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">Impact Level</p>
            <p className="text-xl font-black italic">PRINCIPAL</p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative">
        <div className="absolute inset-0 lg:hidden z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="mb-12">
            <Link href="/" className="inline-flex relative group mb-10">
              <div className="relative w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-all duration-700">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-white to-silver-100 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/20 overflow-hidden">
                  <svg className="w-8 h-8 text-black relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 8V16L12 20L20 16V8L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M8 10L12 16L16 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            </Link>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Establish <span className="text-indigo-500 text-glow-indigo">Connection</span></h1>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Identity Verification Required</p>
          </div>

          <div className="glass-panel p-10 backdrop-blur-3xl border-white/10 hover:border-indigo-500/30 transition-all group">
            {/* Social Auth Section */}
            <div className="mb-8 space-y-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group/google"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-white/5"></div>
                <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">OR</span>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-2 group/input">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-indigo-500 transition-colors">Access Identifier</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/5"
                    placeholder="name@valor.io"
                    required
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-indigo-500/50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2 group/input">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-indigo-500 transition-colors">Security Key</label>
                  <button type="button" className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-indigo-400 transition-colors">Lost Access?</button>
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all placeholder:text-white/5"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-indigo-500/50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-rose-400 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="btn-indigo w-full py-5 text-[11px] group relative overflow-hidden shadow-[0_0_50px_-10px_rgba(99,102,241,0.3)] hover:shadow-indigo-500/50"
              >
                <span className="relative z-10">{loading ? "Synchronizing..." : "Establish Connection"}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                New to the mission? <Link href="/auth/signup" className="text-indigo-500 hover:text-white transition-colors ml-1 underline decoration-indigo-500/30 underline-offset-4">Create Account</Link>
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center opacity-20">
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">VALOR NEXUS • SECURE ACCESS GATEWAY</p>
          </div>
        </div>
      </div>
    </main>
  );
}
