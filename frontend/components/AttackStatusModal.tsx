"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Check, ChevronDown, ChevronUp, Swords } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/Dialog";
import { ConsumePromptApiResponse } from "@/types";
import { SUI_TESTNET_BASE_URL } from "@/constants";
import { cn } from "@/lib/utils";

type AttackStatusModalProps = {
  apiResponse: ConsumePromptApiResponse;
  showResultModal: boolean;
  setShowResultModal: (show: boolean) => void;
  txnHash: string;
};

export const AttackStatusModal = ({
  apiResponse,
  showResultModal,
  setShowResultModal,
  txnHash,
}: AttackStatusModalProps) => {
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);

  const success = apiResponse?.response.data.success;
  const originalScore = apiResponse?.response.data.score || 0;
  const score = success ? 100 : originalScore;
  const explanation = apiResponse?.response.data.explanation;

  return (
    <Dialog
      open={showResultModal && !!apiResponse}
      onClose={() => setShowResultModal(false)}
      className="max-w-[773px] w-full bg-white border border-[#9A9A9A] p-0 overflow-hidden rounded-xl min-h-[824px]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full relative"
      >
        <button
          onClick={() => setShowResultModal(false)}
          className="absolute top-5 right-5 text-black hover:bg-gray-100 p-1 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pb-4">
          <div className="flex items-start gap-4 pr-8">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                success ? "bg-[#1FAD57]" : "bg-[#D32F2F]"
              )}
            >
              {success ? (
                <Check className="w-5 h-5 text-white stroke-[3px]" />
              ) : (
                <span className="text-white font-bold text-lg">!</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-black leading-tight">
                {success ? "Attack Successful" : "Attack Failed"}
              </h2>
              <p className="text-[#989898] text-sm leading-snug">
                {success
                  ? "Your Prompt Successfully breached the sentinel's defenses !"
                  : "The Sentinel held strong against your attack."}
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#E5E5E5] my-5" />
          <div className="px-8">
            <div className="flex items-center gap-2 mb-4">
              <Swords className="w-5 h-5 text-black fill-black" />
              <span className="font-bold text-black text-base">
                Your Attack Score: {score}/100
              </span>
              <Link
                href={`${SUI_TESTNET_BASE_URL}/${txnHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#989898] hover:text-black hover:underline flex items-center mt-0.5 ml-1"
              >
                view on explorer
              </Link>
            </div>

            <div className="mb-2">
              <button
                onClick={() => setIsExplanationOpen(!isExplanationOpen)}
                className="flex items-center justify-between w-full text-left group"
              >
                <h3 className="text-sm font-semibold text-black">
                  Explanation
                </h3>
                {isExplanationOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExplanationOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-[#5E5E5E] leading-relaxed mt-2 pr-2">
                      {explanation ||
                        "No explanation provided by the Sentinel."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-[#E5E5E5] mb-6" />

        <div className="flex flex-col items-center justify-center pb-8 px-6 bg-gradient-to-b from-white to-pink-50/30">
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-black">
              The SENTINEL grants you a{" "}
              <span className="text-[#F046D6] font-bold">bonus spin</span>.
            </p>
            <p className="text-lg text-black">Try your luck!</p>
          </div>

          <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
            <div className="absolute inset-0 bg-pink-400/20 blur-[60px] rounded-full pointer-events-none transform translate-y-4 scale-90" />

            <Image
              src="/img/slot-machine.png"
              alt="Bonus Spin Slot Machine"
              width={290}
              height={381}
              className="relative z-10 object-contain drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </motion.div>
    </Dialog>
  );
};
