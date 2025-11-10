import { Github } from 'lucide-react'
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

export const LOCAL_API_PATH = 'http://3.237.26.201:3000'

export const SUI_CONFIG = {
  EXAMPLES_PACKAGE_ID: '0xb60f1539130c55fc2777bef0fa6712ed97de2a3e38b46ce5956e6425a3d079fc',
  MODULE_NAME: 'sentinel',
  OTW_NAME: 'SENTINEL',
  AGENT_REGISTRY: '0x176f639651ecf7f72c43a0fa2abe76f3fb4b7d0a86a475c9ad9059bfad6eff95',
  ENCLAVE_OBJECT_ID: '0x3c3b60f42cbd091068699581f2df55af49d10f10a27833c699b4bccc5ecc06a0',
  PROTOCOL_CONFIG_OBJECT_ID: '0x077ff74c2c033261a4eaecf3840cfba49a64c19d713be8d9ea17c17e0080eb58',
  AGENT_OBJECT_IDS: [''],
}

export const EXPLORER_BASE_URL = 'https://testnet.suivision.xyz'
export const MIST_PER_SUI = 1_000_000_000
export const SUI_TESTNET_BASE_URL = 'https://testnet.suivision.xyz/txblock/'
export const PROJECT_GITHUB_URL = 'https://github.com/satyambnsal/sui-sentinal'
export const NAUTILUS_URL = 'https://github.com/MystenLabs/nautilus'
export const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=U3qMdgSGASI'
export const X_URL = 'https://x.com/suisentinal'

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
].map((wallet) => wallet.toLowerCase())

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
  { href: SUI_SENTINEL_GITHUB_URL, icon: Github, isImage: false, alt: 'GitHub', name: 'Github' },
  {
    href: SUI_SENTINEL_DOCS_URL,
    icon: '/icons/docs_outline.png',
    isImage: true,
    alt: 'Documentation',
    name: 'Docs',
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
