import { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SlotReel } from "./SlotReel";
import { useClaimReward } from "@/hooks/rewards/useClaimReward";

export const SlotMachine = () => {
  const account = useCurrentAccount();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number[]>([7, 7, 7]);

  const { mutateAsync: claimTokens, isPending } = useClaimReward();

  const handleSpin = async () => {
    if (isSpinning || isPending) return;

    if (!account?.address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSpinning(true);

    try {
      const data = await claimTokens({ recipient: account.address });

      if (data.transferSuccess && data.rewardAmount) {
        const digits = String(data.rewardAmount)
          .padStart(3, "0")
          .slice(-3)
          .split("")
          .map(Number);

        setResult(digits);
        toast.success(`You won ${data.rewardAmount} tokens!`);
      } else {
        toast.error("Spin failed. No rewards available or transfer failed.");
      }
    } catch (error) {
      console.error("Spin failed", error);
      toast.error(error instanceof Error ? error.message : "Failed to spin");
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="relative w-fit mx-auto mt-4">
      <div className="relative z-0">
        <Image
          src="/img/slot-machine.png"
          width={290}
          height={381}
          alt="slot machine"
          className="pointer-events-none"
        />
      </div>

      <div className="absolute top-[68px] left-[48px] z-10 flex gap-1 rounded-[20px] overflow-hidden">
        <SlotReel value={result[0]} isSpinning={isSpinning} delay={0} />
        <SlotReel value={result[1]} isSpinning={isSpinning} delay={0.2} />
        <SlotReel value={result[2]} isSpinning={isSpinning} delay={0.4} />
      </div>

      <div className="overflow-hidden absolute bottom-[90px] left-[31px] w-[150px] h-[51px] z-20">
        <button
          onClick={handleSpin}
          disabled={isSpinning || isPending}
          className="transition-transform duration-100 active:translate-y-[14px] disabled:opacity-80 disabled:cursor-not-allowed group"
        >
          <Image
            src="/img/slot-button.png"
            width={150}
            height={51}
            alt="Spin!"
            className="group-hover:brightness-110 transition-all"
          />
          {/* {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-[14px]">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )} */}
        </button>
      </div>
    </div>
  );
};
