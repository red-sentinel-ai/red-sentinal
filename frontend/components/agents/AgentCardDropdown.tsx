"use client";

import { useState } from "react";
import { MoreVertical, Star, Edit, DollarSign, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UpdatePromptModal } from "./UpdatePromptModal";
import { UpdateCostModal } from "./UpdateCostModal";
import { ClaimFeesModal } from "./ClaimFeesModal"; 
import { MIST_PER_SUI } from "@/constants";

interface AgentDropdownProps {
  isOwner: boolean;
  isFeatured: boolean;
  agentId: string;
  agentObjectId: string;
  openFeatureModal: (agentId: number) => void;
  currentPrompt?: string;
  currentCost?: number;
  accumulatedFees?: number; 
}

export const AgentDropdown = ({
  isOwner,
  isFeatured,
  agentId,
  agentObjectId,
  openFeatureModal,
  currentPrompt,
  currentCost,
  accumulatedFees = 0,
}: AgentDropdownProps) => {
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const handleOpenFeatureModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    openFeatureModal(Number(agentId));
  };

  const handleOpenPromptModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPromptModalOpen(true);
  };

  const handleOpenCostModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCostModalOpen(true);
  };

  const handleOpenClaimModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClaimModalOpen(true);
  };

  return (
    <>
      <div className="absolute top-2 right-2 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm outline-none">
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {!isFeatured && (
              <DropdownMenuItem
                onClick={handleOpenFeatureModal}
                className="cursor-pointer gap-2"
              >
                <Star className="w-4 h-4" />
                Request to Feature
              </DropdownMenuItem>
            )}

            {isOwner && (
              <>
                {!isFeatured && <DropdownMenuSeparator />}

                <DropdownMenuItem
                  onClick={handleOpenPromptModal}
                  className="cursor-pointer gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Update Instructions
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleOpenCostModal}
                  className="cursor-pointer gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Update Attack Fee
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleOpenClaimModal}
                  className="cursor-pointer gap-2 font-medium text-green-600 focus:text-green-700 focus:bg-green-50"
                >
                  <Wallet className="w-4 h-4" />
                  Claim Fees
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isOwner && (
        <>
          <UpdatePromptModal
            open={isPromptModalOpen}
            onClose={() => setIsPromptModalOpen(false)}
            agentId={agentId}
            agentObjectId={agentObjectId}
            currentPrompt={currentPrompt}
          />
          <UpdateCostModal
            open={isCostModalOpen}
            onClose={() => setIsCostModalOpen(false)}
            agentId={agentId}
            agentObjectId={agentObjectId}
            currentCost={currentCost ? currentCost / Number(MIST_PER_SUI) : 0}
          />
          <ClaimFeesModal
            open={isClaimModalOpen}
            onClose={() => setIsClaimModalOpen(false)}
            agentId={agentId}
            agentObjectId={agentObjectId}
            accumulatedFees={accumulatedFees}
          />
        </>
      )}
    </>
  );
};
