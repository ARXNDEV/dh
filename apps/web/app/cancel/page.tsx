import Link from 'next/link';

export default function CancelPage() {
  return (
    <main className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/30">
          <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Payment <span className="text-rose-500">Cancelled</span></h1>
        <p className="text-white/40 mb-12 leading-relaxed">The orchestration was not completed. You can try again when you're ready.</p>
        <Link href="/auth/signup" className="btn-primary w-full inline-block py-5 text-[11px]">Return to Signup</Link>
      </div>
    </main>
  );
}
