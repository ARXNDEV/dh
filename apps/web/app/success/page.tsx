"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const [activating, setActivating] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const activateSubscription = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        if (session.authenticated) {
          // Activate subscription in MongoDB
          await fetch('/api/admin/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: session.user.id, 
              subscriptionStatus: 'active' 
            }),
          });
        }
      } catch (err) {
        console.error('Activation failed:', err);
      } finally {
        setActivating(false);
      }
    };

    activateSubscription();
  }, []);

  return (
    <main className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/30">
          <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
          Subscription <span className="text-indigo-500">{activating ? "Initializing" : "Active"}</span>
        </h1>
        <p className="text-white/40 mb-12 leading-relaxed">
          {activating 
            ? "Orchestrating your legacy node connection..." 
            : "Your legacy node has been successfully initialized. Welcome to the collective."}
        </p>
        <Link 
          href="/dashboard" 
          className={`btn-indigo w-full inline-block py-5 text-[11px] ${activating ? 'opacity-50 pointer-events-none' : ''}`}
        >
          Enter Dashboard
        </Link>
      </div>
    </main>
  );
}
