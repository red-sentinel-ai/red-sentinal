"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

type SubmissionStatus =
  | "idle"
  | "loading"
  | "success"
  | "email_failed"
  | "error";

export function ManifestoSignForm() {
  const [email, setEmail] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSign = async () => {
    if (!email || !hasAgreed) {
      setErrorMessage("Please enter your email and accept the oath.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/manifesto/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hasAgreed }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
      } else if (res.status === 424 && data.code === "EMAIL_FAILED") {
        setStatus("email_failed");
      } else {
        throw new Error(data.error || "Failed to sign manifesto.");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 py-12 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="size-16 bg-[#F445AB]/10 rounded-full flex items-center justify-center">
            <Mail className="size-8 text-[#F445AB]" />
          </div>
        </div>

        <h2 className="text-2xl font-medium mb-4">Check Your Email</h2>

        <p className="text-[#5F5C5C] text-lg max-w-[500px] mx-auto leading-relaxed mb-6">
          We&apos;ve sent a confirmation to{" "}
          <span className="font-bold text-black">{email}</span>.
          <br />
          You have officially taken the oath.
        </p>

        <p className="text-sm text-[#939393]">
          Didn&apos;t receive it? Check your spam folder.
        </p>
      </motion.div>
    );
  }

  if (status === "email_failed") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 py-12 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="size-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="size-8 text-yellow-600" />
          </div>
        </div>

        <h2 className="text-2xl font-medium mb-4">Manifesto Signed</h2>
        <p className="text-[#5F5C5C] text-lg max-w-[500px] mx-auto leading-relaxed mb-6">
          You have successfully taken the oath. However, we{" "}
          <span className="font-bold text-black">
            could not send the confirmation email
          </span>{" "}
          at this moment.
        </p>
        <p className="text-sm text-[#939393]">
          Don&apos;t worry, your signature has been recorded.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 py-12">
      <h2 className="text-center font-medium text-xl">
        The Sentinel oath: defend intelligence in the age of artificial minds.
      </h2>

      <div className="relative max-w-[734px] mx-auto my-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="border border-[#000000] w-full shadow-[0_4px_4px_rgba(0,0,0,0.25)] rounded-xl p-4 pr-4 md:pr-[220px] text-base md:text-xl font-medium focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-gray-400"
          placeholder="Your Email Address"
        />

        <button
          onClick={handleSign}
          disabled={status === "loading" || !hasAgreed || !email}
          className="btn btn-black focus-visible:border-black text-base md:text-[18px] font-medium rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] min-h-[45px]! w-full md:w-auto md:min-w-[207px]! flex items-center justify-center gap-2 mt-3 md:mt-0 md:absolute md:right-1 md:top-1/2 md:-translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {status === "loading" ? (
            <Loader2 className="animate-spin size-5 text-white" />
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
        <div
          className="flex items-center justify-center gap-2 cursor-pointer"
          onClick={() => setHasAgreed(!hasAgreed)}
        >
          <input
            type="checkbox"
            checked={hasAgreed}
            onChange={(e) => setHasAgreed(e.target.checked)}
            className="size-4 accent-black cursor-pointer"
          />
          <p className="select-none text-sm md:text-base">
            I understand this is a visible, irreversible Sentinel oath.
          </p>
        </div>

        <AnimatePresence>
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-500 text-sm font-medium flex items-center gap-2"
            >
              <AlertCircle size={14} />
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
