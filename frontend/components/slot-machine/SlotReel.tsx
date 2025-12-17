import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const REEL_HEIGHT = 130;
const TILE_HEIGHT = 46;

const NUMBER_COLORS = [
  "bg-[#FF47BC] border-[#FF85D3]", // Pink
  "bg-[#9D4EDD] border-[#C77DFF]", // Purple
  "bg-[#00CC66] border-[#33FF99]", // Green
  "bg-[#00A8E8] border-[#4CC9F0]", // Blue
  "bg-[#FFC107] border-[#FFE082]", // Yellow
];

const getTileColor = (num: number) => NUMBER_COLORS[num % NUMBER_COLORS.length];

type SlotReelProps = {
  value: number;
  isSpinning: boolean;
  delay: number;
};

export const SlotReel = ({ value, isSpinning, delay }: SlotReelProps) => {
  const controls = useAnimation();
  const numbers = [...Array(10).keys(), ...Array(10).keys()];

  useEffect(() => {
    const handleAnimation = async () => {
      if (isSpinning) {
        await controls.start({
          y: [0, -10 * TILE_HEIGHT],
          transition: {
            duration: 0.2,
            ease: "linear",
            repeat: Infinity,
          },
        });
      } else {
        const targetIndex = 10 + value;
        const finalY =
          -(targetIndex * TILE_HEIGHT) + REEL_HEIGHT / 2 - TILE_HEIGHT / 2;

        await new Promise((resolve) => setTimeout(resolve, delay * 1000));

        await controls.start({
          y: finalY,
          transition: {
            duration: 0.8,
            ease: [0.2, 0.8, 0.2, 1],
            type: "spring",
            stiffness: 60,
            damping: 15,
          },
        });
      }
    };

    handleAnimation();
  }, [isSpinning, value, delay, controls]);

  return (
    <div
      className="relative overflow-hidden w-[60px]"
      style={{ height: `${REEL_HEIGHT}px` }}
    >
      <motion.div
        animate={controls}
        initial={{ y: 0 }}
        className="flex flex-col items-center"
      >
        {numbers.map((num, i) => (
          <div
            key={i}
            className={`
              w-[40px] h-[40px] m-[5px] flex items-center justify-center 
              rounded-md text-white font-black text-2xl 
              border-b-4 shadow-sm select-none
              ${getTileColor(num)}
            `}
            style={{ height: `${TILE_HEIGHT - 10}px` }}
          >
            {num}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
