import Image from "next/image";

export function ManifestoModal() {
  return (
    <div>
      <div className="border border-[#9A9A9A] rounded-xl bg-white/80 py-6 px-12 mx-auto max-w-[862px]">
        <div className="flex items-center gap-2">
          <div>
            <Image
              src="/icons/logo-sm.svg"
              width={42}
              height={42}
              alt="logo smalll"
            />
          </div>
          <h1 className="font-medium text-[32px]">
            The Sentinel <span className="text-[#C871FF]"> Manifesto</span>
          </h1>
        </div>

        <div className="border-t border-[#D9D9D9] my-6"></div>

        <div className="pt-8">
          <h2 className="text-2xl font-medium mb-3">
            The Race We Didn't Choose
          </h2>
          <div className="text-[#484848]">
            <p className="my-6">
              "If you're worried about immigration taking jobs, you should be
              way more worried about AI, because it's like a flood of millions
              of new digital immigrants that are Nobel Prize-level capability,
              work at superhuman speeds, and will work for less than minimum
              wage." — Tristan Harris
            </p>
            <p className="my-6">
              We stand at a crossroads in human history. AI companies are racing
              toward AGI (artificial general intelligence) with the fervor of
              gold miners and the caution of gamblers. They're betting
              everything on a technology they don't fully understand, deploying
              systems they can't completely control, and when pressed about the
              risks, they retreat into determinism, inevitability, and the cold
              comfort of being first. <br />
              But here's what they won't tell you: they don't know how their own
              systems work.
            </p>
            <p className="my-6">
              As Professor Stuart Russell puts it, imagine a chain-link fence
              stretching across 1,000 square miles covering all of San Francisco
              or all of London. That fence has a trillion adjustable parameters,
              and we've made quintillions of random adjustments to those
              parameters until we got behavior that looked right. We don't
              understand what's happening inside that fence. We just know it
              works. until it doesn't.
            </p>
          </div>
        </div>

        <div className="pt-8">
          <h2 className="text-2xl font-medium mb-3">Saga of King Midas</h2>
          <div className="text-[#484848]">
            <p className="my-6">
              King Midas ruled Phrygia in great luxury, but despite all he had,
              he was consumed by his love for gold. When Dionysus granted him a
              single wish, Midas asked that everything he touched turn to gold.
              At first, he rejoiced as tables, flowers, and carpets gleamed at
              his fingertips. But the miracle became a curse when his food and
              water hardened into metal, and his daughter turned to a lifeless
              statue in his arms. He died in misery and starvation, surrounded
              by wealth he couldn't use.
            </p>
            <p className="my-6">
              This is AI's fundamental problem. We're building systems by
              specifying objectives: maximize engagement, minimize costs,
              optimize outcomes. But we can't properly specify what we actually
              want. Any attempt to write down our true objectives precisely
              enough for a superintelligent machine to follow them will be
              wrong. And when you give a machine an objective that isn't aligned
              with what you truly want, you're setting up a chess match, one
              you'll lose when the machine becomes sufficiently intelligent.
            </p>
          </div>
        </div>

        <div className="pt-8">
          <h2 className="text-2xl font-medium mb-3">The Gorilla Problem</h2>
          <div className="text-[#484848]">
            <p className="my-6">
              A few million years ago, the human line branched off from the
              gorilla line in evolution. Now gorillas have no say in whether
              they continue to exist. They can't negotiate with us. They can't
              appeal to our better nature. They simply exist at our mercy
              because we are much smarter than they are.
            </p>
            <p className="my-6">
              Intelligence is the single most important factor for control on
              Earth. It's the ability to bring about what you want in the world.
              And we're in the process of making something more intelligent than
              us. The gorillas looking at humans might wonder: "Was that
              branching a good idea?" They have no power over their own fate
              because the more intelligent species holds all the cards. We could
              make them extinct in weeks if we chose to, and there's nothing
              they could do about it. That's our future with superintelligent AI
              unless we change course. As Professor Russell asks: "How are you
              gonna retain power forever over entities more powerful than
              yourself?"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
