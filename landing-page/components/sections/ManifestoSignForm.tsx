import Image from "next/image";

export function ManifestoSignForm() {
  return (
    <div className="bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] px-6 py-12">
      <h2 className="text-center font-medium text-xl">
        The Sentinel oath: defend intelligence in the age of artificial minds.
      </h2>
      <div className="relative min-h-[53px] max-w-[734px] mx-auto my-6">
        <input
          className="border border-[#000000] absolute inset-0 shadow-[0_4px_4px_rgba(0,0,0,0.25)] rounded-xl p-4 text-xl font-medium"
          placeholder="Your Email Address"
        />
        <button className="btn btn-black focus-visible:border-black text-[18px] font-medium rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] min-h-[45px]! min-w-[207px]! flex items-center justify-center gap-1 absolute right-1 top-1/2 -translate-y-1/2">
          <Image
            src="/icons/signature.png"
            width={24}
            height={24}
            alt="signature"
          />
          <span>Sign Manifesto</span>
        </button>
      </div>

      <div>
        <div className="flex items-center justify-center gap-2">
          <input type="checkbox" />
          <p>I understand this is a visible, irreversible Sentinel oath.</p>
        </div>
      </div>
    </div>
  );
}
