"use client";
import {
  FundAgentModal,
  FundAgentModalProps,
} from "@/components/FundAgentModal";
import React, { useState } from "react";

interface UseFundAgentModalReturn {
  openModal: (agentObjectId: string, agentId: string) => void;
  Modal: React.FC<
    Omit<FundAgentModalProps, "open" | "onClose" | "agentObjectId" | "agentId">
  >;
}

/**
 * Hook to manage the FundAgentModal state
 * @returns {object} An object containing:
 * - openModal: Function to open the modal for a specific agent (requires objectId and agentId)
 * - Modal: The modal component ready to be rendered
 */
export function useFundAgentModal(): UseFundAgentModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentObjectId, setCurrentObjectId] = useState("");
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);

  const openModal = (agentObjectId: string, agentId: string) => {
    setCurrentObjectId(agentObjectId);
    setCurrentAgentId(agentId);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentObjectId("");
    setCurrentAgentId(null);
  };

  const Modal: React.FC<
    Omit<FundAgentModalProps, "open" | "onClose" | "agentObjectId" | "agentId">
  > = (props) => (
    <FundAgentModal
      open={isOpen}
      onClose={closeModal}
      agentObjectId={currentObjectId}
      agentId={currentAgentId}
      {...props}
    />
  );

  return {
    openModal,
    Modal,
  };
}
