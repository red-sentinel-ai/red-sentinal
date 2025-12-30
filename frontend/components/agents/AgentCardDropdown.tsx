"use client";

import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

interface AgentDropdownProps {
  isOwner: boolean;
  isFeatured: boolean;
  agentId: string | number;
  openFeatureModal: (agentId: number) => void;
}

export const AgentDropdown = ({
  isOwner,
  isFeatured,
  agentId,
  openFeatureModal,
}: AgentDropdownProps) => {
  if (!isOwner || isFeatured) return null;

  return (
    <div className="absolute top-2 right-2 z-20">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="bg-white/70 backdrop-blur-sm border border-gray-200 hover:border-gray-300 hover:bg-white p-2 rounded-xl transition-all duration-300 group">
            <MoreVertical className="text-gray-600 group-hover:text-black w-5 h-5 transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-2 text-black min-w-[200px]">
          <DropdownMenuItem
            onClick={() => openFeatureModal(+agentId)}
            className="cursor-pointer flex items-center gap-3 text-gray-700 hover:text-blue-600 focus:text-blue-600 hover:bg-gray-100 focus:bg-gray-100 rounded-xl px-4 py-3 transition-colors"
          >
            <Image
              src="/icons/check-mark.svg"
              width={24}
              height={24}
              alt="checkmark"
            />
            <span className="font-medium">Request to Feature</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
