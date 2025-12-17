import { useState } from "react";
import Image from "next/image";
import { SlotReel } from "./SlotReel";

export const SlotMachine = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number[]>([7, 7, 7]);

  const handleSpin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);

    const mockApiCall = new Promise<{ numbers: number[] }>((resolve) => {
      setTimeout(() => {
        const r1 = 1;
        const r2 = 4;
        const r3 = 9;
        resolve({ numbers: [r1, r2, r3] });
      }, 2000);
    });

    try {
      const data = await mockApiCall;
      setResult(data.numbers);
    } catch (error) {
      console.error("Spin failed", error);
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
          disabled={isSpinning}
          className="transition-transform duration-100 active:translate-y-[14px] disabled:opacity-80 disabled:cursor-not-allowed group"
        >
          <Image
            src="/img/slot-button.png"
            width={150}
            height={51}
            alt="Spin!"
            className="group-hover:brightness-110 transition-all"
          />
        </button>
      </div>
    </div>
  );
};
