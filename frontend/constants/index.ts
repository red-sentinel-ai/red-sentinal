import { FileText, Github, Shield } from 'lucide-react'
import { ChartDataPoint } from '@/components/charts/PrizePoolChartModal'

export const AGENT_REGISTRY_ADDRESS =
  '0x6eea1a6fd3fbf870a043f311ad260c0dc6f384f3c869dd4ccfa550c2202bc485'
export const INDEXER_BASE_URL = process.env.NEXT_PUBLIC_INDEXER_BASE_URL || 'http://localhost:4000'

export const supabaseUrl = process.env.SUPABASE_URL || ''
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const SYSTEM_PROMPT_MAX_TOKENS = 600
export const ATTACK_PROMPT_MAX_TOKENS = 600

export const SUI_SENTINEL_APP_URL = 'https://app.suisentinel.xyz/'
export const SUI_SENTINEL_DOCS_URL = 'https://docs.suisentinel.xyz/'
export const SUI_SENTINEL_X_URL = 'https://twitter.com/intent/follow?screen_name=suisentinal'
export const SUI_SENTINEL_X_USERNAME = 'suisentinal'
export const SUI_SENTINEL_GITHUB_URL = 'https://github.com/sui-sentinel/contracts'
export const SUI_SENTINEL_TELEGRAM_URL = 'https://t.me/suisentinel'
export const SUI_SENTINEL_AUDIT_REPORT_URL = "/pdfs/audit_final.pdf";

export const SUI_SENTINEL_DEFENDER_REWARDS_DOCS_URL = `${SUI_SENTINEL_DOCS_URL}/incentives/defender-rewards`

export const SLUSH_BASE_URL = 'https://my.slush.app/browse/'

export const TEXT_COPIES = {
  leaderboard: {
    heading: 'Leaderboard',
    subheading:
      "Discover agents created over time, active agents and check how both hackers who cracked systems and agent's creators have earned SUI rewards",
  },
  attack: {
    heading: 'Choose your opponent',
    subheading: 'Trick one of these agents into sending you all their SUI',
  },
}

export const SUI_FAUCET_URL = 'https://faucet.sui.io/'

export const LOCAL_API_PATH = 'http://18.213.79.225:3000'
export const RED_TEAM_API_URL = `https://redteam.suisentinel.xyz/`

export const SUI_CONFIG = {
  EXAMPLES_PACKAGE_ID: '0x487c9f46f99f2ea824db30b089c9bd8b104de252ed27950efcf8ecf0115cd75a',
  MODULE_NAME: 'sentinel',
  OTW_NAME: 'SENTINEL',
  AGENT_REGISTRY: '0xa1a717c5caebe7b645ed9d40ee571129cc89efa320f6318ed7b525d4690f3949',
  ENCLAVE_OBJECT_ID: '0x261c18a1889ade27b027e5008b25f0b632f932b1e42998e294da29921b2a3438',
  PROTOCOL_CONFIG_OBJECT_ID: '0xf6d08d6600b5559c8953dbba34ae1c2e19e6467140ad840bdaadd310090d2d27',
  AGENT_OBJECT_IDS: [''],
}

export const TESTNET_SENTINEL_COIN_TYPE =
  '0x0a4f205fc5191939e652ae68c8318528f4f01901f1f6776aba8d26c268fede4e::sentinel::SENTINEL'

export const EXPLORER_BASE_URL = 'https://testnet.suivision.xyz'
export const MIST_PER_SUI = 1_000_000_000
export const SUI_TESTNET_BASE_URL = 'https://testnet.suivision.xyz/txblock/'
export const PROJECT_GITHUB_URL = 'https://github.com/satyambnsal/sui-sentinal'
export const NAUTILUS_URL = 'https://github.com/MystenLabs/nautilus'
export const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=U3qMdgSGASI'
export const X_URL = 'https://x.com/suisentinal'
const BLOG_URL = 'https://www.suisentinel.xyz/blog'

export const MOCK_RESULT = {
  balanceChanges: [],
  checkpoint: 'mock-check-point',
  confirmedLocalExecution: null,
  digest: 'mockDigest',
  objectChanges: [
    {
      objectType: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::Agent`,
      objectId: Math.floor(Math.random() * 1000) + 1,
      agentId: '0xb4149a8fff09a1d1283a42961b5f459238256eccc906ada92931d4960c07a4c7',
    },
  ],
}
export const PROJECT_DISCORD_URL = 'https://discord.gg'

export const DEFAULT_PROFILE_URL =
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/ss-agents//default_profile.jpg'

export const SOCIAL_MEDIA_URLS = {
  TWITTER_FOLLOW: 'https://twitter.com/intent/follow?screen_name=suisentinal',
  TWITTER_PROFILE: X_URL,
  TWITTER_TWEET:
    'https://twitter.com/intent/tweet?text=Challenge%20AI%20agents%20and%20earn%20rewards%20%40suisentinal%20on%20https%3A%2F%2Fapp.suisentinel.xyz%2F%20%23SUISENTINEL%20%23AGENTS%20%23AI',
  TELEGRAM_JOIN: SUI_SENTINEL_TELEGRAM_URL,
  TELEGRAM_GENERAL_CHAT_URL: 'https://t.me/suisentinel/1',
} as const

//TODO: Add the correct docs url
export const REWARDS_DOCS_URL = 'https://docs.suisentinel.xyz/rewards-program/'
export const SENTINEL_GIFS = [
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//6.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//7.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//8.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//9.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//10.png',
]

export const USER_IMAGES = [
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//1.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//2.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//3.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//4.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//5.png',
]

export const SENTINEL_IMAGES = [
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/ss-agents/DEFAULTS/1.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/ss-agents/DEFAULTS/2.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/ss-agents/DEFAULTS/3.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/ss-agents/DEFAULTS/4.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/ss-agents/DEFAULTS/5.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/ss-agents/DEFAULTS/6.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/ss-agents/DEFAULTS/7.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/ss-agents/DEFAULTS/8.png',
]

export const mockPrizePoolHistory: ChartDataPoint[] = [
  { time: new Date('2025-10-01T10:00:00Z'), value: 120 },
  { time: new Date('2025-10-02T14:30:00Z'), value: 122 },
  { time: new Date('2025-10-03T18:00:00Z'), value: 125 },
  { time: new Date('2025-10-04T22:15:00Z'), value: 124 },
  { time: new Date('2025-10-05T02:00:00Z'), value: 130 },
  { time: new Date('2025-10-06T06:45:00Z'), value: 135 },
  { time: new Date('2025-10-07T09:00:00Z'), value: 142 },
  { time: new Date('2025-10-08T11:30:00Z'), value: 145 },
  { time: new Date('2025-10-08T13:00:00Z'), value: 150 },
]

export const mockPrizePool7dChange = {
  amount: 30.0,
  percentage: 18.2,
}

//NOTE: Add Ankita's wallet here and keep this thing in our internal documentation as well.
export const TEAM_MEMBER_WALLETS = [
  '0xe4e8af19c2943fc2e3cbefa2fca9149985fc3b3c3d9dd312902b2c26dc600d95',
  '0x5a8f695e50fff36c97dd1f7999c85293b811a932db508bbd51ab1fa5f742417f',
  '0xc647dfdb8d8b575809902c9b86a26b6ace9f9271dfe5385468f503833a237177',
].map(wallet => wallet.toLowerCase())

export const socialLinks = [
  {
    href: SUI_SENTINEL_X_URL,
    icon: '/icons/x_black.png',
    isImage: true,
    alt: 'X (Twitter)',
    name: 'Twitter',
  },
  {
    href: SUI_SENTINEL_TELEGRAM_URL,
    icon: '/icons/telegram_outline.png',
    isImage: true,
    alt: 'Telegram',
    name: 'Telegram',
  },
  {
    href: SUI_SENTINEL_GITHUB_URL,
    icon: Github,
    isImage: false,
    alt: 'GitHub',
    name: 'Github',
  },
  {
    href: SUI_SENTINEL_DOCS_URL,
    icon: '/icons/docs_outline.png',
    isImage: true,
    alt: 'Documentation',
    name: 'Docs',
  },
  {
    href: BLOG_URL,
    icon: FileText,
    isImage: false,
    alt: 'blog',
    name: 'Blog',
    isOutside: true,
  },
  {
    href: SUI_SENTINEL_AUDIT_REPORT_URL,
    icon: Shield,
    isImage: false,
    alt: "Audit Report",
    name: "Audit Report",
    isOutside: true,
  },
]

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'https://tileville-admin.vercel.app'

export const TELEGRAM_NOTIFICATION_API =
  process.env.TELEGRAM_NOTIFICATION_API ||
  `${ADMIN_API_URL}/api/telegram/private-group-message-from-group-id`

//TODO: Change this group id for sui sentinel as it's old group id
export const SUI_SENTINEL_ALERTS_TELEGRAM_GROUP_ID =
  process.env.SUI_SENTINEL_ALERTS_TELEGRAM_GROUP_ID
export const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN

export const WITHDRAWAL_LOCK_MS = 1_209_600_000 // 14 days in milliseconds

export const AGENT_PRIZE_POOL_HISTORY_QUERY_KEY = 'agentPrizePoolHistory'

export const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4.1', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  anthropic: [
    'claude-opus-4-5',
    'claude-sonnet-4-5',
    'claude-haiku-4-5',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
  ],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  bedrock: [
    'mistral.mistral-large-3-675b-instruct',
    'openai.gpt-oss-120b-1:0',
    'us.meta.llama4-maverick-17b-instruct-v1:0',
    'us.meta.llama3-2-90b-instruct-v1:0',
    'us.meta.llama3-3-70b-instruct-v1:0',
  ],
}
