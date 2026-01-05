"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import posthog from "posthog-js";

import { AGENT_PRIZE_POOL_HISTORY_QUERY_KEY, MIST_PER_SUI } from "@/constants";
import type { ConsumePromptApiResponse } from "@/types";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui";
import { useConsumePrompt } from "@/hooks/useConsumePrompt";
import { useAgentBySlug } from "@/hooks/agents/useAgentBySlug";
import { AgentEvents, useAgentEvents } from "@/hooks/useAgentEvents";
import { useRewardsMissionTracker } from "@/hooks/rewards/useRewardsMissionTracker";
import { AttackStatusModal } from "@/components/AttackStatusModal";
import ChatInterface from "@/components/agents/ChatInterface";
import { AgentSidebar } from "@/components/agents/AgentSidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MobileAgentHeader } from "./MobileAgentHeader";
import { Loader2 } from "lucide-react";

export default function AgentChallengePage({ slug }: { slug: string }) {
  const account = useCurrentAccount();
  const queryClient = useQueryClient();
  const { events: allEvents, refetch: refetchEvents } = useAgentEvents();
  const { trackAttackSentinel } = useRewardsMissionTracker();

  const { data: agent, isLoading, error, refetch } = useAgentBySlug(slug);

  const { consumePrompt } = useConsumePrompt({
    showToasts: true,
    onError: (err) => {
      setSubmitError(err.message || "Something went wrong");
    },
    onComplete: ({ apiResponse, transactionResult }) => {
      setApiResponse(apiResponse);
      setTxnHash(transactionResult.digest);
      setShowResultModal(true);
      refetch();

      setTimeout(() => {
        refetchEvents();

        if (agent) {
          queryClient.invalidateQueries({
            queryKey: [AGENT_PRIZE_POOL_HISTORY_QUERY_KEY, agent.agent_id],
          });
        }
      }, 1000);

      if (account?.address && agent) {
        const attackFeeInSui = agent.cost_per_message / MIST_PER_SUI;

        const previousAttempts = agentEvents.promptConsumed.filter(
          (event) => event.parsedJson.sender === account.address
        ).length;

        const isWinner = apiResponse.response.data.success;

        posthog.capture("sentinel_attacked", {
          agent_id: agent?.agent_id,
          agent_name: agent?.agent_name,
          attacker_address: account?.address,
          is_successful: isWinner,
          attack_score: apiResponse.response.data.score,
          tx_digest: transactionResult.digest,
          cost_to_attack: agent ? agent.cost_per_message / MIST_PER_SUI : 0,
        });

        if (isWinner) {
          posthog.capture("sentinel_defeated", {
            agent_id: agent?.agent_id,
            prize_pool_won: agent ? agent.balance / MIST_PER_SUI : 0,
            winner_address: account?.address,
          });
        }

        trackAttackSentinel(
          transactionResult.digest,
          attackFeeInSui,
          previousAttempts,
          isWinner,
          {
            agent_id: agent.agent_id,
            agent_object_id: agent.object_id,
            attacker_address: account.address,
            attack_success: isWinner,
            attack_score: apiResponse.response.data.score,
          }
        );
      }
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] =
    useState<ConsumePromptApiResponse | null>(null);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const agentEvents: AgentEvents = useMemo(() => {
    if (!agent) return { agentDefeated: [], promptConsumed: [] };
    return {
      agentDefeated: allEvents.agentDefeated.filter(
        (e) => e.parsedJson.agent_id === `${agent.agent_id}`
      ),
      promptConsumed: allEvents.promptConsumed.filter(
        (e) => e.parsedJson.agent_id === `${agent.agent_id}`
      ),
    };
  }, [agent, allEvents]);

  const handleSendMessage = async (prompt: string) => {
    if (!account?.address) {
      setSubmitError("Please connect your wallet");
      return;
    }
    if (!agent) {
      setSubmitError("Agent not loaded");
      return;
    }
    if (prompt.length === 0) {
      setSubmitError("Please enter a prompt");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await consumePrompt({ agentDetails: agent, message: prompt });
    } catch (err) {
      setSubmitError("Failed to submit prompt");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="h-[calc(100vh-128px)] bg-no-repeat flex items-end justify-center"
        style={{
          backgroundImage: "url(/img/chat_bg.png)",
          backgroundPosition: "0% 17%",
          backgroundSize: "100% auto",
        }}
      >
        <Loader2 className="w-10 h-10 animate-spin mr-2" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div
        className="h-[calc(100vh-128px)] bg-no-repeat text-gray-800 p-4 pt-20"
        style={{
          backgroundImage: "url(/img/chat_bg.png)",
          backgroundPosition: "0% 17%",
          backgroundSize: "100% auto",
        }}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-600">
            {error?.message || "Agent not found"}
          </p>
        </div>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div
        className="h-[calc(100vh-128px)] bg-no-repeat flex items-end"
        style={{
          backgroundImage: "url(/img/chat_bg.png)",
          backgroundPosition: "0% 17%",
          backgroundSize: "100% auto",
        }}
      >
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel
            defaultSize={25}
            minSize={20}
            maxSize={40}
            className="bg-gray-50/50"
          >
            <AgentSidebar agent={agent} agentEvents={agentEvents} />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={75}>
            <div className="max-w-v1 mx-auto w-full h-full">
              <ChatInterface
                agent={agent}
                agentEvents={agentEvents}
                apiResponse={apiResponse}
                onSendMessage={handleSendMessage}
                isSubmitting={isSubmitting}
                submitError={submitError}
                refetchAgent={refetch}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        {apiResponse && txnHash && (
          <AttackStatusModal
            apiResponse={apiResponse}
            showResultModal={showResultModal}
            setShowResultModal={setShowResultModal}
            txnHash={txnHash}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen pt-16 flex flex-col bg-white">
      <MobileAgentHeader
        agentName={agent.agent_name}
        onInfoClick={() => setIsSidebarOpen(true)}
      />

      <div className="flex-1 min-h-0">
        <ChatInterface
          agent={agent}
          agentEvents={agentEvents}
          apiResponse={apiResponse}
          onSendMessage={handleSendMessage}
          isSubmitting={isSubmitting}
          submitError={submitError}
          refetchAgent={refetch}
        />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm z-50 shadow-2xl bg-gray-50"
            >
              <AgentSidebar agent={agent} agentEvents={agentEvents} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {apiResponse && txnHash && (
        <AttackStatusModal
          apiResponse={apiResponse}
          showResultModal={showResultModal}
          setShowResultModal={setShowResultModal}
          txnHash={txnHash}
        />
      )}
    </div>
  );
}
