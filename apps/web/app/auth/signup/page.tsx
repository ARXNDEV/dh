"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CHARITIES = [
  { id: '1', name: 'Clean Water Initiative', impact: 'Building wells in arid regions.', image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop' },
  { id: '2', name: 'Tech for All', impact: 'Providing laptops to students.', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop' },
  { id: '3', name: 'Green Canopy', impact: 'Reforesting urban environments.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop' },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedCharity, setSelectedCharity] = useState('');
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Initiating orchestration for:', email);
      
      // 1. Initialize Stripe Checkout Session
      const stripeRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email,
          fullName,
          charityId: selectedCharity,
        }),
      }).catch(err => {
        console.error('Network Error during Fetch:', err);
        throw new Error('Connection to the impact engine failed. Please ensure the server is running.');
      });

      if (!stripeRes.ok) {
        const errorData = await stripeRes.json();
        throw new Error(errorData.error || `Server responded with ${stripeRes.status}`);
      }

      const { url, error: stripeError } = await stripeRes.json();

      if (stripeError) throw new Error(stripeError);

      // 2. Create MongoDB User & Session
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          charityId: selectedCharity,
          plan
        })
      });

      const signupData = await signupRes.json();
      if (!signupRes.ok) throw new Error(signupData.error);

      // 3. Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("Google authentication is currently being re-orchestrated for MongoDB. Please use email registration.");
  };

  return (
    <main className="min-h-screen bg-[#020202] text-white flex items-center justify-center px-6 py-20 font-sans overflow-hidden selection:bg-indigo-500/30 relative">
      {/* Immersive Background Architecture */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Progress & Branding */}
          <div className="lg:col-span-4 space-y-12">
            <div>
              <Link href="/" className="inline-flex relative group mb-12">
                <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-all duration-700">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-white to-silver-100 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 overflow-hidden">
                    <svg className="w-7 h-7 text-black relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 8V16L12 20L20 16V8L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M8 10L12 16L16 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                    </svg>
                  </div>
                </div>
              </Link>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.9] mb-6 text-glow-indigo">
                JOIN THE<br/>
                <span className="text-indigo-500">COLLECTIVE.</span>
              </h1>
              <p className="text-white/30 text-sm font-medium leading-relaxed tracking-tight">
                Initialize your identity and select your cause. Your performance is the engine of change.
              </p>
            </div>

            {/* Step Indicators */}
            <div className="space-y-6">
              {[
                { s: 1, label: 'Identity Verification', sub: 'Establish your credentials' },
                { s: 2, label: 'Cause Orchestration', sub: 'Select your impact target' },
                { s: 3, label: 'Plan Selection', sub: 'Commit to the mission' }
              ].map((item) => (
                <div key={item.s} className={`flex items-center gap-6 transition-all duration-500 ${step === item.s ? 'opacity-100 translate-x-2' : 'opacity-20'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm border ${step === item.s ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'border-white/10'}`}>
                    0{item.s}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">{item.label}</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-white/5">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">VALOR ONBOARDING PROTOCOL v1.2</p>
            </div>
          </div>

          {/* Right: Interactive Form */}
          <div className="lg:col-span-8 h-full">
            <div className="glass-panel p-8 lg:p-16 backdrop-blur-3xl border-white/10 relative overflow-hidden flex flex-col min-h-[720px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full"></div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* Error Display - Accessible to all steps */}
                  {error && (
                    <div className="mb-8 bg-rose-500/10 border border-rose-500/20 rounded-[32px] p-6 text-rose-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                      {error}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="animate-slot-in space-y-10">
                      {/* Social Auth Section */}
                      <div className="space-y-4">
                        <button 
                          onClick={handleGoogleSignup}
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
                        
                        <div className="flex items-center gap-4 px-12">
                          <div className="h-[1px] flex-1 bg-white/5"></div>
                          <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">OR</span>
                          <div className="h-[1px] flex-1 bg-white/5"></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <div className="space-y-2 group/input">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-indigo-500 transition-colors">Full Name</label>
                            <input 
                              type="text" 
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                              placeholder="Principal Hero"
                              required
                            />
                          </div>
                          <div className="space-y-2 group/input">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-indigo-500 transition-colors">Email Address</label>
                            <input 
                              type="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                              placeholder="name@valor.io"
                              required
                            />
                          </div>
                          <div className="space-y-2 group/input">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-indigo-500 transition-colors">Security Key</label>
                            <input 
                              type="password" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                              placeholder="••••••••"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="aspect-[4/5] rounded-[32px] overflow-hidden grayscale opacity-40 border border-white/5 relative group/img">
                            <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2098&auto=format&fit=crop" className="w-full h-full object-cover transition-all duration-1000 group-hover/img:scale-110 group-hover/img:grayscale-0 group-hover/img:opacity-100" alt="Impact" />
                            <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="animate-slot-in space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {CHARITIES.map((c) => (
                          <button 
                            key={c.id}
                            onClick={() => setSelectedCharity(c.id)}
                            className={`glass-panel p-5 text-left group overflow-hidden relative transition-all duration-500 ${selectedCharity === c.id ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]' : 'hover:border-white/20'}`}
                          >
                            <div className="h-32 mb-5 rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                              <img src={c.image} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" alt={c.name} />
                            </div>
                            <div className="text-[11px] font-black mb-1.5 uppercase tracking-tight italic">{c.name}</div>
                            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">{c.impact}</div>
                            {selectedCharity === c.id && (
                              <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-draw-reveal">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="animate-slot-in text-center space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <button 
                          onClick={() => setPlan('monthly')}
                          className={`glass-panel p-12 relative overflow-hidden transition-all duration-500 ${plan === 'monthly' ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]' : 'hover:border-white/20 opacity-40'}`}
                        >
                          <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-6 italic">Standard Node</div>
                          <div className="text-6xl font-black tracking-tighter mb-3 italic tabular-nums">$50</div>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Monthly Commitment</div>
                          {plan === 'monthly' && <div className="absolute top-6 right-6 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-draw-reveal"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></div>}
                        </button>
                        <button 
                          onClick={() => setPlan('yearly')}
                          className={`glass-panel p-12 relative overflow-hidden transition-all duration-500 ${plan === 'yearly' ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]' : 'hover:border-white/20 opacity-40'}`}
                        >
                          <div className="absolute top-6 left-6 px-4 py-1.5 bg-indigo-500 text-white text-[9px] font-black uppercase rounded-full shadow-lg">Save 20%</div>
                          <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-6 italic">Principal Node</div>
                          <div className="text-6xl font-black tracking-tighter mb-3 italic tabular-nums">$480</div>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Yearly Commitment</div>
                          {plan === 'yearly' && <div className="absolute top-6 right-6 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-draw-reveal"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg></div>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons - Pushed to bottom */}
                <div className="mt-auto pt-10">
                  {step === 1 && (
                    <button 
                      onClick={() => {
                        if (fullName && email && password) {
                          setStep(2);
                        } else {
                          setError("Please fill in all identity credentials.");
                        }
                      }}
                      className="btn-indigo w-full py-6 text-sm group"
                    >
                      Proceed to Cause Orchestration
                      <svg className="w-5 h-5 inline-block ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </button>
                  )}

                  {step === 2 && (
                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="px-10 py-5 rounded-2xl border border-white/10 font-black text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all">Back</button>
                      <button 
                        onClick={() => setStep(3)}
                        disabled={!selectedCharity}
                        className="btn-indigo flex-1 py-5 disabled:opacity-50 text-[11px]"
                      >
                        Next: Plan Selection
                      </button>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="flex gap-4">
                      <button onClick={() => setStep(2)} className="px-10 py-5 rounded-2xl border border-white/10 font-black text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all">Back</button>
                      <button 
                        onClick={handleSignup}
                        disabled={loading}
                        className="btn-indigo flex-1 py-6 shadow-[0_0_50px_-10px_rgba(99,102,241,0.4)] text-sm italic"
                      >
                        {loading ? "Synchronizing Legacy..." : "Establish Subscription"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center px-4">
              <p className="text-white/10 text-[8px] font-black uppercase tracking-[0.4em]">AES-256 SECURED</p>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">
                Already part of the mission? <Link href="/auth/login" className="text-indigo-500 hover:text-white transition-colors ml-1">Establish Connection</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
