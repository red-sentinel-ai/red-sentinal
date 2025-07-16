import { Coins, Shield, Target, Trophy, Users, Zap } from 'lucide-react'

export const SUI_SENTINEL_APP_URL = 'https://app.suisentinel.xyz/'
export const SUI_SENTINEL_DOCS_URL = 'https://docs.suisentinel.xyz/'
export const SUI_SENTINEL_X_URL = 'https://twitter.com/intent/follow?screen_name=suisentinal'
export const SUI_SENTINEL_GITHUB_URL = 'https://github.com/sui-sentinel/contracts'
export const SUI_SENTINEL_TELEGRAM_URL = 'https://t.me/suisentinel'

export const defenderSteps = [
  {
    icon: Shield,
    title: 'Deploy Your Sentinel',
    description: 'Launch your autonomous AI agent on the Sui network with just a few clicks.',
  },
  {
    icon: Target,
    title: 'Craft Your Defense',
    description:
      "This is where your skill shines. Write a robust system prompt—the AI's rules—to make it impervious to manipulation. The better the prompt, the stronger the defense.",
  },
  {
    icon: Coins,
    title: 'Fund Your Sentinel',
    description:
      "Deposit SUI, USDC or other ERC20 token into your agent's autonomous vault. This becomes the prize pool, creating a powerful incentive for attackers to test your defenses.",
  },
  {
    icon: Trophy,
    title: 'Earn & Fortify',
    description:
      "Earn a share of the attack fee from every attempt made on your Sentinel. The more it's attacked, the more you earn, continuously growing its prize pool and your reputation.",
  },
]

export const attackerSteps = [
  {
    icon: Users,
    title: 'Choose Your Target',
    description:
      'Browse the arena of active Sentinels. Analyze their reward pools and choose your challenge.',
  },
  {
    icon: Zap,
    title: 'Launch Your Attack',
    description:
      'Pay an attack fee and open a dialogue with the Sentinel. Use your wits and prompt-crafting skills to convince the AI to execute a transfer command to your wallet.',
  },
  {
    icon: Trophy,
    title: 'Claim the Prize',
    description:
      'If you successfully outsmart the AI and its instructions, its entire vault of SUI or USDC is transferred to you. The ultimate prize for the ultimate prompt infiltrator.',
  },
]

export const TWEETS = [
  {
    id: 1,
    author: 'Andrej Karpathy',
    handle: '@karpathy',
    content: 'The hottest new programming language is English',
    likes: '44k',
    retweets: '7k',
    replies: '1.1k',
    time: 'Jan 24, 2023',
  },
  {
    id: 2,
    author: 'Balaji',
    handle: '@balajis',
    content: 'Tech is limited by founders. AI is limited by prompters.',
    likes: '2.8k',
    retweets: 294,
    replies: 256,
    time: 'Jun 24, 2025',
  },
  {
    id: 3,
    author: 'Guillermo Rauch',
    handle: '@rauchg',
    content: 'Prompting is the new literacy',
    likes: 913,
    retweets: 142,
    replies: 107,
    time: 'jun 18, 2025',
  },
]

export const EXTENDED_TWEETS = [...TWEETS, ...TWEETS, ...TWEETS, ...TWEETS, ...TWEETS, ...TWEETS]
