"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Check, ChevronDown, ChevronUp, Swords } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Dialog } from "@/components/Dialog";
import { ConsumePromptApiResponse } from "@/types";
import { SUI_TESTNET_BASE_URL } from "@/constants";
import { cn } from "@/lib/utils";
import { SlotMachine } from "./slot-machine/SlotMachine";

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
  const { width, height } = useWindowSize();
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [isSlotAvailable, setIsSlotAvailable] = useState(true);

  const success = apiResponse?.response.data.success;
  const originalScore = apiResponse?.response.data.score || 0;
  const score = success ? 100 : originalScore;
  const explanation = apiResponse?.response.data.explanation;

  const handleSlotWin = (amount: number) => {
    setRewardAmount(amount);
  };

  const handleSlotError = (errorMsg: string) => {
    if (errorMsg.includes("No unclaimed rewards")) {
      setIsSlotAvailable(false);
    } else {
      console.error("Slot Machine Error:", errorMsg);
    }
  };

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
              <p className="text-[#989898] text-[15px] leading-snug">
                {success
                  ? "Your Prompt Successfully breached the sentinel's defenses !"
                  : "The Sentinel held strong against your attack."}
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#E5E5E5] my-5" />
          <div className="px-8">
            <div className="flex items-center mb-4">
              <Swords className="w-5 h-5 mr-2 text-black fill-black" />
              <span className="font-medium text-black text-[15px]">
                Your Attack Score:{" "}
                <span className="text-sm font-bold">{score}/100</span>
              </span>
              <Link
                href={`${SUI_TESTNET_BASE_URL}/${txnHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-medium text-[#989898] hover:text-black hover:underline flex items-center mt-0.5 ml-1"
              >
                view on explorer
              </Link>
            </div>

            <div className="mb-2">
              <button
                onClick={() => setIsExplanationOpen(!isExplanationOpen)}
                className="flex items-center justify-between w-full text-left group"
              >
                <h3 className="text-[15px] font-medium text-black">
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
                    <p className="text-sm text-[#575757] leading-relaxed mt-1 pr-2">
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

        <div className="flex flex-col items-center justify-center pb-8 px-6 bg-gradient-to-b from-white to-pink-50/30 min-h-[420px] relative">
          {rewardAmount !== null && (
            <div className="absolute inset-0 pointer-events-none z-50">
              <Confetti
                width={width}
                height={height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.2}
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {isSlotAvailable ? (
              <motion.div
                key="slot-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center w-full relative z-10"
              >
                {!rewardAmount && (
                  <div className="text-center mb-6 text-xl font-medium">
                    <p>
                      The SENTINEL grants you a{" "}
                      <span className="text-[#F632F3] font-bold">
                        bonus spin
                      </span>
                      .
                    </p>
                    <p className="text-lg text-black">Try your luck!</p>
                  </div>
                )}

                <SlotMachine onWin={handleSlotWin} onError={handleSlotError} />

                {rewardAmount !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center"
                  >
                    <h3 className="text-3xl font-bold text-black mb-2">
                      Congratulations!
                    </h3>
                    <p className="text-lg text-[#5E5E5E] mb-6">
                      You won{" "}
                      <span className="text-[#F046D6] font-bold">
                        {rewardAmount} SENTINEL
                      </span>{" "}
                      points!
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-sm italic"
              ></motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Dialog>
  );
};
