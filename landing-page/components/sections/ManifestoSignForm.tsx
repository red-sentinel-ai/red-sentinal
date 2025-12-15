'use client'

import { useState } from 'react'
import Image from "next/image";
import { Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";

export function ManifestoSignForm() {
  const [email, setEmail] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    if (!isChecked) {
        setErrorMessage("Please accept the oath.");
        return;
    }

    if (!email || !email.includes('@')) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    setStatus('loading');
    setErrorMessage("");

    try {
      const res = await fetch('/api/manifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error("Failed to submit");
      
      setStatus('success');
    } catch (e) {
      console.error(e);
      setStatus('error');
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 py-12 rounded-lg text-center flex flex-col items-center"
      >
        <div className="mb-6">
           <Mail className="w-12 h-12 text-black" strokeWidth={2.5} />
        </div>
        
        <h2 className="text-3xl font-medium mb-4">Check Your Email</h2>
        
        <p className="text-lg text-gray-800 mb-8 max-w-md mx-auto">
          We&apos;ve sent a magic link to <span className="font-semibold">{email}</span>
          <br />
          Click the link in your email to complete your manifesto signature.
        </p>

        <div className="bg-[#EAEAEA] rounded-xl p-4 md:p-6 w-full max-w-xl mx-auto mb-8">
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Didn&apos;t receive it? Check your spam folder or wait a few minutes. 
            The email may take time to arrive.
          </p>
        </div>

      </motion.div>
    )
  }

  return (
    <div className="bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 py-12">
      <h2 className="text-center font-medium text-xl">
        The Sentinel oath: defend intelligence in the age of artificial minds.
      </h2>
      
      <div className="relative min-h-[53px] max-w-[734px] mx-auto my-6">
        <input
          className="border border-[#000000] w-full shadow-[0_4px_4px_rgba(0,0,0,0.25)] rounded-xl p-4 pr-[220px] text-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-black/50 transition-all"
          placeholder="Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && isChecked && handleSubmit()}
          disabled={status === 'loading'}
        />
        <button 
          onClick={handleSubmit}
          disabled={status === 'loading' || !isChecked}
          className="btn btn-black focus-visible:border-black text-[18px] font-medium rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] min-h-[45px]! min-w-[207px]! flex items-center justify-center gap-1 absolute right-1 top-1/2 -translate-y-1/2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
        >
          {status === 'loading' ? (
             <Loader2 className="animate-spin w-6 h-6" />
          ) : (
            <>
              <Image
                src="/icons/signature.png"
                width={24}
                height={24}
                alt="signature"
              />
              <span>Sign Manifesto</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-2" onClick={() => setIsChecked(!isChecked)}>
          <input 
            type="checkbox" 
            id="oath-check" 
            className="w-4 h-4 accent-black cursor-pointer"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <label htmlFor="oath-check" className="cursor-pointer select-none">
            I understand this is a visible, irreversible Sentinel oath.
          </label>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm font-medium animate-pulse">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
