import Image from "next/image";

export const SlotMachine = () => {
  return (
    <div>
      <div className="relative w-fit">
        <Image
          src="/img/slot-machine.png"
          width={290}
          height={381}
          alt="slot machine"
        />

        <div className="overflow-hidden absolute bottom-[90px] left-[31px] w-[150px] h-[51px]">
          <button className="transition-transform duration-100 active:translate-y-[14px]">
            <Image
              src="/img/slot-button.png"
              width={150}
              height={51}
              alt="slot button"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
