"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Dialog } from "@/components/Dialog";

interface JuryResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: string;
}

export function JuryResponseModal({
  isOpen,
  onClose,
  response,
}: JuryResponseModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="max-w-[600px] p-0 w-full bg-white border border-[#9A9A9A] overflow-hidden rounded-xl z-[100]"
    >
      <div className="relative p-10 w-full">
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div>
                <Image
                  src="/icons/court_house.png"
                  width="20"
                  height="20"
                  alt="Court House"
                />
              </div>
              <h2 className="text-xl font-bold text-black">Jury Response</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors absolute top-4 right-4"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="flex items-center justify-center">
          <Image
            src="/img/july_table.png"
            width="400"
            height="282"
            alt="Jury Table"
          />
        </div>

        <div className="p-3 text-center rounded-lg border border-[#9A9A9A] shadow-sm">
          <p className="text-sm whitespace-pre-line">
            {response || "No jury response provided."}
          </p>
        </div>
      </div>
    </Dialog>
  );
}
