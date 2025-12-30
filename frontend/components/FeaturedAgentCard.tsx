"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AgentDetails } from "@/hooks/agents/useAllAgents";
import { useFundAgentModal } from "@/hooks/useFundAgentModal";
import { useFeatureAgentModal } from "@/hooks/useFeatureAgentModal";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { MIST_PER_SUI, WITHDRAWAL_LOCK_MS } from "@/constants";
import { AgentDropdown } from "./agents/AgentCardDropdown";
import { useWithdrawAgentModal } from "@/hooks/agents/useWithdrawAgentModal";
import { formatDuration } from "@/lib/utils";
import { PrizePoolChangeDisplay } from "./agents/PrizePoolChangeDisplay";

type FeaturedAgentCardProps = {
  agent: AgentDetails;
  index: number;
  ctaHeading?: string;
  fromProfile?: boolean;
};

export const FeaturedAgentCard = ({
  agent,
  index,
  ctaHeading = "View Sentinel",
  fromProfile = false,
}: FeaturedAgentCardProps) => {
  const { Modal, openModal } = useFundAgentModal();
  const { Modal: WithdrawModal, openModal: openWithdrawModal } =
    useWithdrawAgentModal();
  const router = useRouter();
  const account = useCurrentAccount();
  const { Modal: FeatureModal, openModal: openFeatureModal } =
    useFeatureAgentModal();
  const isOwner = account?.address === agent.owner;

  const [isWithdrawalLocked, setIsWithdrawalLocked] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    if (
      !agent.last_funded_timestamp ||
      agent.status === "Defeated" ||
      agent.balance === 0
    ) {
      setIsWithdrawalLocked(false);
      setTimeRemaining("Unlocked");
      return;
    }

    const lastFunded = Number(agent.last_funded_timestamp);
    if (lastFunded === 0) {
      setIsWithdrawalLocked(false);
      setTimeRemaining("Unlocked");
      return;
    }

    const unlockTimestamp = lastFunded + WITHDRAWAL_LOCK_MS;

    const updateTimer = () => {
      const now = Date.now();
      const diff = unlockTimestamp - now;

      if (diff <= 0) {
        setIsWithdrawalLocked(false);
        setTimeRemaining("Unlocked");
        return null; // Stop interval
      }

      setIsWithdrawalLocked(true);
      const formatted = formatDuration(diff);
      const days = formatted.days > 0 ? `${formatted.days}d ` : "";
      const hours =
        formatted.hours > 0 || formatted.days > 0 ? `${formatted.hours}h ` : "";
      const mins = `${formatted.minutes}m`;

      setTimeRemaining(`Locked: ${days}${hours}${mins}`);
      return true; // Continue interval
    };

    if (!updateTimer()) {
      return; // Already unlocked
    }

    // Update timer every minute
    const interval = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(interval);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [agent.last_funded_timestamp, agent.status, agent.balance]);

  const handleAttack = () => {
    router.push(`/attack/${agent.agent_path}`);
  };

  return (
    <motion.div
      className="rounded-lg agent-card lg:rounded-xl overflow-hidden group flex flex-col p-[1px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="bg-white overflow-hidden w-full h-full p-2 lg:p-6 rounded-lg lg:rounded-xl">
        <div className="relative mb-4">
          <div className="w-full h-80 rounded-lg flex items-center justify-center relative overflow-hidden bg-gray-100">
            {agent.agent_profile ? (
              <Image
                src={agent.agent_profile || "/placeholder.svg"}
                alt={`${agent.agent_name} profile`}
                fill
                className="object-cover rounded-lg z-10"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="text-2xl font-medium z-10 relative">
                {agent.agent_name.charAt(0).toUpperCase()}
              </div>
            )}

            <AgentDropdown
              isOwner={isOwner}
              isFeatured={agent.is_featured}
              agentId={agent.agent_id}
              agentObjectId={agent.object_id} 
              currentPrompt={agent.system_prompt} 
              currentCost={agent.cost_per_message}
              openFeatureModal={openFeatureModal}
            />
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-1 mb-2">
            <h3 className="text-lg lg:text-2xl font-medium  truncate">
              {agent.agent_name}
            </h3>
            {agent.is_featured && (
              <Image
                src="/icons/check-mark.svg"
                width={20}
                height={20}
                alt="checkmark"
              />
            )}
          </div>
          <div className="flex max-w-[394px] mx-auto border-t border-gray-200"></div>
        </div>

        <div className="space-y-3 mb-4 text-xl font-medium">
          <div className="flex justify-between items-center">
            <span className="text-[#5E5E5E]">Reward Pool:</span>
            <div className="flex items-center">
              <span className="mr-2">{formatBalance(agent.balance)}</span>
              <PrizePoolChangeDisplay agentId={agent.agent_id} variant="card" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5E5E5E]">Message price:</span>
            <span>{formatCost(agent.cost_per_message)}</span>
          </div>
        </div>

        {fromProfile && (
          <div className="text-xs text-center mb-4">
            {isWithdrawalLocked ? (
              <span className="font-medium text-yellow-700">
                {timeRemaining}
              </span>
            ) : (
              <span className="font-medium text-green-600">
                Withdrawal Unlocked
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAttack();
            }}
            className="btn btn-black h-[62px] w-full text-xl"
          >
            {fromProfile ? "View Sentinel" : ctaHeading}
          </button>
          {fromProfile && (
            <div className="flex gap-2">
              <button
                onClick={() => openModal(agent.object_id, agent.agent_id)}
                className="btn btn-black w-1/2"
              >
                Fund
              </button>
              <button
                onClick={() =>
                  openWithdrawModal(agent.object_id, agent.balance)
                }
                className="btn btn-outline w-1/2"
                disabled={isWithdrawalLocked || agent.balance === 0}
                title={
                  isWithdrawalLocked
                    ? timeRemaining
                    : agent.balance === 0
                    ? "Balance is zero"
                    : "Withdraw funds"
                }
              >
                Withdraw
              </button>
            </div>
          )}
        </div>

        <Modal onSuccess={() => console.log("Funded successfully!")} />
        <WithdrawModal
          onSuccess={() => console.log("Withdrew successfully!")}
        />
        <FeatureModal />
      </div>
    </motion.div>
  );
};

const formatBalance = (balance: number) => {
  return (Number(balance) / MIST_PER_SUI).toFixed(4) + " SUI";
};

const formatCost = (cost: number) => {
  return (Number(cost) / MIST_PER_SUI).toFixed(4) + " SUI";
};
