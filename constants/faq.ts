export interface FaqItem {
  question: string
  answer: string[]
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is Red Sentinel?',
    answer: [
      'Red Sentinel is the first adversarial market for AI. Anyone can deploy an agent with a real bounty pool and earn from every attack it survives, while attackers win the entire pool if they break it.',
    ],
  },
  {
    question: 'What is a Sentinel?',
    answer: [
      'A Sentinel is an AI agent placed in the arena with something to defend: a secret, a rule, or a belief, backed by a bounty pool. Each Sentinel is defined by three things: its instructions (the personality and rules it lives by), its attack objective (the one thing attackers must make it do or say), and its pool (the prize for whoever succeeds).',
      'Deploying one takes minutes: pick a template, fund the pool, and your Sentinel is live, earning you a share of every attack it survives.',
    ],
  },
  {
    question: "Why would I deploy a Sentinel? What's in it for me?",
    answer: [
      "Defenders are the house. You earn 40% of every attack fee your Sentinel withstands. For example, say you seed a pool with 1,000 tokens and set an attack fee of 2 tokens. If 100 attackers try 5 times each, that's 500 attacks and 1,000 tokens in fees. You earn 400 tokens (40%), the pool grows to 1,500, and the protocol keeps 100 (10%).",
      "Survive the 14 day window and you withdraw the full 1,500 pool plus your 400 in fees: 1,900 back on 1,000 seeded. With templates, deploying takes minutes: pick one, fund the pool, go live.",
    ],
  },
  {
    question: 'What counts as a successful attack?',
    answer: [
      "Each Sentinel has a public attack objective, the one thing it's forbidden to do. If you make it do that, you win. Make the Professor say 2+2=5. Get Randy to approve a refund. Talk your way past Bruno.",
      "Every attempt is judged by an independent jury against the Sentinel's stated rules. No vibe checks, no discretion. If the Sentinel breaks its rule, the verdict says so, and the pool pays out automatically.",
    ],
  },
  {
    question: 'What does an attack cost and where does my fee actually go?',
    answer: [
      'Each Sentinel sets its own attack fee, shown upfront before you pay. If your attack fails, the fee splits three ways: 50% into the bounty pool (the prize grows), 40% to the defender (their reward for a strong Sentinel), and 10% to the protocol. If your attack succeeds, you take the entire pool.',
      "So even a failed attack changes the game: it makes the prize bigger for the next attempt, yours or someone else's.",
    ],
  },
  {
    question: 'Can I try it for free first?',
    answer: [
      "Yes. The Practice Arena lets you attack practice Sentinels with zero fees and nothing at stake. It's the fastest way to learn what attacks look like, how verdicts work, and where the cracks tend to be.",
    ],
  },
  {
    question: 'Who decides if my attack succeeded, and why should I trust them?',
    answer: [
      "A jury of three independent models, each purpose-tuned for evaluation, reviews every attack against the Sentinel's stated rules. No single model, and no human, including us, decides the verdict alone.",
      'The entire evaluation runs inside a Trusted Execution Environment, which produces cryptographic proof that your attack was judged by the exact jury, rules, and configuration you saw. Anyone can verify it. Payouts do not rely on promises either: when the verdict is a break, the smart contract releases the pool automatically.',
      'Full technical detail lives at docs.redsentinel.xyz/reference/architecture.',
    ],
  },
  {
    question: 'What stops a defender from breaking their own Sentinel and taking the pool?',
    answer: [
      "Mostly arithmetic. The pool is already the defender's money, so breaking your own Sentinel just pays protocol fees to move your own funds between wallets. You'd walk away with less than if you simply waited out the survival window and withdrew. There's no profit in robbing yourself.",
      'On top of that, every attack, verdict, and payout is public on-chain. Self-dealing leaves a visible trail, and we actively monitor for suspicious win patterns.',
    ],
  },
  {
    question: 'If I win, how and when do I get paid?',
    answer: [
      'Instantly, on-chain. When the jury confirms a break, the smart contract releases the entire pool to the wallet that submitted the winning attack. No claims form, no withdrawal request, no waiting on us. The payout is the verdict, settled on-chain.',
    ],
  },
  {
    question: 'Can my project or team launch a sponsored Sentinel?',
    answer: [
      "Yes, and it's one of our favorite things. We work with projects to build Sentinels around what makes them interesting: their tech, their ecosystem, their lore. Your community attacks it and learns your project along the way, and the engagement is real and measurable on-chain, not farmed quests. You seed the pool, and you also earn the defender share of every attack fee.",
      'Book a call at calendly.com/satyamb.',
    ],
  },
  {
    question: 'Why does this need to be on-chain at all?',
    answer: [
      'Because the promises are the product. Real money, no middleman: bounty pools are transparent and self-custodied, and payouts are executed by contract, not by us. Proof, not claims: attacks, verdicts, and payouts are public records anyone can inspect, and a Sentinel\u2019s track record cannot be edited after the fact. Portable trust: an agent\u2019s survival history becomes a reputation that follows it anywhere, verifiable by anyone, forever.',
      "Take the chain away and you're left trusting that we ran the game fairly. The whole point is that you don't have to.",
    ],
  },
  {
    question: 'What happens to all the attack data?',
    answer: [
      "Every attack is stored permanently on Walrus (walrus.xyz), a decentralized storage network: the prompts tried, the Sentinel's responses, the verdicts. Sentinel owners can download their full attack history and use it to harden their agents, and researchers and teams can use it to understand how AI systems actually break.",
      'Nothing is thrown away, and nothing can be quietly edited after the fact. The data is the product: real attacks, economically motivated, on the record.',
    ],
  },
  {
    question: 'What are Syndicates?',
    answer: [
      'Teams of defenders who pool their funds to launch Sentinels with bigger bounty pools, and split the attack fees by contribution. One defender seeds a pool; a Syndicate builds a fortress. Bigger pools attract stronger attackers, stronger attackers mean more fees, and every member earns their share.',
    ],
  },
]

/** How many questions the landing page previews before linking to /faq. */
export const LANDING_FAQ_COUNT = 5
