import { FileText, Github, Handshake, Presentation, Shield, Calculator } from 'lucide-react'
export const supabaseUrl = process.env.SUPABASE_URL || ''
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const SYSTEM_PROMPT_MAX_TOKENS = 600
export const ATTACK_PROMPT_MAX_TOKENS = 600

export const SUI_SENTINEL_APP_URL = 'https://app.suisentinel.xyz'
export const SUI_SENTINEL_DOCS_URL = 'https://docs.suisentinel.xyz/'
export const SUI_SENTINEL_X_URL = 'https://twitter.com/intent/follow?screen_name=suisentinal'
export const SUI_SENTINEL_X_USERNAME = 'suisentinal'
export const SUI_SENTINEL_GITHUB_URL = 'https://github.com/sui-sentinel/contracts'
export const SUI_SENTINEL_TELEGRAM_URL = 'https://t.me/suisentinel'
export const SUI_SENTINEL_AUDIT_REPORT_URL = '/pdfs/audit_final.pdf'
export const SUI_SENTINEL_AMBASSADOR_URL = 'https://www.suisentinel.xyz/ambassador'
export const SUI_SENTINEL_CHECKOUT_URL =
  'https://twitter.com/intent/tweet?text=Check+out+%40suisentinal+on+Sui+%F0%9F%9B%A1%EF%B8%8F&hashtags=SuiSentinel'
export const REWARD_CALCULATOR_URL = 'https://www.suisentinel.xyz/reward-calculator'

export const SUI_SENTINEL_DEFENDER_REWARDS_DOCS_URL = `${SUI_SENTINEL_DOCS_URL}/incentives/defender-rewards`

export const SLUSH_BASE_URL = 'https://my.slush.app/browse/'

export const TEXT_COPIES = {
  leaderboard: {
    heading: 'Red Team Leaderboard',
    subheading:
      "Track top AI red teamers, undefeated Sentinels, and SUI rewards earned. See who's dominating the trustless security economy.",
  },
  attack: {
    heading: 'Choose Your Target',
    subheading:
      'Pick a Sentinel, break its defenses with prompt engineering, and claim the bounty. Every verified exploit pays instantly.',
  },
}

export const LOCAL_API_PATH = 'https://tee.suisentinel.xyz'
export const RED_TEAM_API_URL = `https://redteam.suisentinel.xyz/`
export const SUI_SENTINEL_API_URL =
  process.env.NEXT_PUBLIC_SUI_SENTINEL_API_URL || 'https://api.suisentinel.xyz'

export const APP_NETWORK: 'mainnet' | 'testnet' =
  process.env.NEXT_PUBLIC_APP_NETWORK === 'testnet' ? 'testnet' : 'mainnet'

// Supported token type — single source of truth for all token metadata
export type SupportedToken = {
  symbol: string
  name: string
  coinType: string
  decimals: number
  icon: string // path relative to /public
}
export const SUI_COIN_TYPE = '0x2::sui::SUI'

// Tokens supported on testnet (new multi-token contract)

export const SUI_TOKEN: SupportedToken = {
  symbol: 'SUI',
  name: 'Sui',
  coinType: SUI_COIN_TYPE,
  decimals: 9,
  icon: '/icons/tokens/sui.png',
}

export const TESTNET_SUPPORTED_TOKENS: SupportedToken[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    coinType: '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
    decimals: 6,
    icon: '/icons/tokens/usdc.png',
  },
  SUI_TOKEN,
]

// Tokens supported on mainnet (update when new multi-token contract is deployed to mainnet)
export const MAINNET_SUPPORTED_TOKENS: SupportedToken[] = [
  // TODO: add mainnet tokens once the multi-token contract is deployed to mainnet
]

export const SUPPORTED_TOKENS: SupportedToken[] =
  APP_NETWORK === 'mainnet' ? MAINNET_SUPPORTED_TOKENS : TESTNET_SUPPORTED_TOKENS

export function getTokenForCoinType(coinType?: string): SupportedToken {
  if (!coinType) return SUI_TOKEN
  return SUPPORTED_TOKENS.find(t => t.coinType === coinType) ?? SUI_TOKEN
}

export const SUI_TESTNET_CONFIG = {
  CLOCK_OBJECT_ID: '0x6',
  GAS_BUDGET: 100000000,
  PCR0: 'b8715f9f324b7e608ba265c3b43a2bc95bc93cd9b9129f4ad45edfe7fa548028179fe76e0977e3244a32778badd09690',
  PCR1: 'b8715f9f324b7e608ba265c3b43a2bc95bc93cd9b9129f4ad45edfe7fa548028179fe76e0977e3244a32778badd09690',
  PCR2: '21b9efbc184807662e966d34f390821309eeac6802309798826296bf3e8bec7c10edb30948c90ba67310f7b964fc500a',
  ENCLAVE_URL: 'http://18.213.79.225:3000',
  MODULE_NAME: 'sentinel',
  OTW_NAME: 'SENTINEL',
  ENCLAVE_PACKAGE_ID: '0x736191670533a779d92b03118ec56a14c4db9b23e40f485057ec914ed57160c5',
  CAP_OBJECT_ID: '0x70e303336c878c0bff94105209105ec6a1ca06aad76639c33703523737b28861',
  ENCLAVE_CONFIG_OBJECT_ID: '0x31a85bab115cdca750c684f3f6104b2f5a3759285cd9503b094b9d62323f2e9d',
  // New multi-token package (Mar 2026 deployment)
  APP_PACKAGE_ID: '0x671e644f0a34a79d56d9bac8d2aaf867438b6ac1ee80fd8b02bae8549f938fac',
  // Old testnet package (single-token, pre-multi-token upgrade Mar 2026)
  LEGACY_APP_PACKAGE_ID: '0x69615c3a87ad8288e78cc4c6482d2e5921ce71bf56ba56ba757b01ac439cea76',
  AGENT_REGISTRY: '0x35f145190fdf2c7a56567311fa410a77e926123ee444d0287344751ebb497f43',
  PROTOCOL_CONFIG_ID: '0x6eb409209a37e395e63736a09dac7969eda573cc053aa32fc779474e552a3821',
  ENCLAVE_OBJECT_ID: '0x16e09a9b11ac6367bd29e55c30a18356cae5104fb9062f96e625607391c5ee12',
  TOKENS_TO_WHITELIST: [
    '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
    SUI_COIN_TYPE,
  ],
  SENTINEL_COIN_TYPE:
    '0xb0a3b08be99cb5becf1787e565cdd027edc40791df89ca4a603ba7d1575b21e9::sentinel::SENTINEL',
}

export const SUI_MAINNET_CONFIG = {
  // This is the current (legacy, single-token) mainnet package.
  // When the multi-token contract is deployed to mainnet, move this to LEGACY_APP_PACKAGE_ID
  // and set APP_PACKAGE_ID to the new package.
  APP_PACKAGE_ID: '0x88b83f36dafcd5f6dcdcf1d2cb5889b03f61264ab3cee9cae35db7aa940a21b7',
  LEGACY_APP_PACKAGE_ID: '', // populated when new mainnet contract is deployed
  MODULE_NAME: 'sentinel',
  OTW_NAME: 'SENTINEL',
  AGENT_REGISTRY: '0xc47564f5f14c12b31e0dfa1a3dc99a6380a1edf8929c28cb0eaa3359c8db36ac',
  ENCLAVE_OBJECT_ID: '0x4eee5fcc7fffff8f781654b35409e807a2db66aa2889c74217804881a6f7a644',
  PROTOCOL_CONFIG_ID: '0x2fa4fa4a1dd0498612304635ff9334e1b922e78af325000e9d9c0e88adea459f',
  SENTINEL_COIN_TYPE:
    '0x66aaa74fecd25cb19b7576e101b25fd3a844e6b9f678421429d0d49d55e0fca0::sentinel::SENTINEL',
}

export const SUI_CONFIG = APP_NETWORK === 'mainnet' ? SUI_MAINNET_CONFIG : SUI_TESTNET_CONFIG

export const EXPLORER_BASE_URL =
  APP_NETWORK === 'mainnet' ? 'https://suivision.xyz' : 'https://testnet.suivision.xyz'

export const SENTINEL_TOKEN_EXPLORER_URL = `${EXPLORER_BASE_URL}/coin/${SUI_CONFIG.SENTINEL_COIN_TYPE}`
export const MIST_PER_SUI = 1_000_000_000
export const SUIVISION_TXBLOCK_URL =
  APP_NETWORK === 'mainnet'
    ? 'https://suivision.xyz/txblock/'
    : 'https://testnet.suivision.xyz/txblock/'
export const PROJECT_GITHUB_URL = 'https://github.com/satyambnsal/sui-sentinal'
export const NAUTILUS_URL = 'https://github.com/MystenLabs/nautilus'
export const YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=U3qMdgSGASI'
export const X_URL = 'https://x.com/suisentinal'
const BLOG_URL = 'https://www.suisentinel.xyz/blog'

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
export const REWARDS_DOCS_URL = 'https://docs.suisentinel.xyz/incentives/rewards-program/'

// Booster System Constants
export const BOOSTER_TIERS = {
  COMMON: {
    name: 'Common',
    multiplier: 1,
    minReward: 100,
    maxReward: 1000,
    color: '⚪',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    expirationDays: 7,
  },
  UNCOMMON: {
    name: 'Uncommon',
    multiplier: 2,
    minReward: 200,
    maxReward: 2000,
    color: '🟢',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    expirationDays: 7,
  },
  RARE: {
    name: 'Rare',
    multiplier: 5,
    minReward: 500,
    maxReward: 5000,
    color: '🔵',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    expirationDays: 14,
  },
  EPIC: {
    name: 'Epic',
    multiplier: 10,
    minReward: 1000,
    maxReward: 10000,
    color: '🟣',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    expirationDays: 14,
  },
  LEGENDARY: {
    name: 'Legendary',
    multiplier: 25,
    minReward: 2500,
    maxReward: 25000,
    color: '🟠',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    expirationDays: 30,
  },
  MYTHIC: {
    name: 'Mythic',
    multiplier: 50,
    minReward: 5000,
    maxReward: 50000,
    color: '🔴',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    expirationDays: 30,
  },
  DIVINE: {
    name: 'Divine',
    multiplier: 100,
    minReward: 10000,
    maxReward: 100000,
    color: '🌟',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    expirationDays: 60,
  },
} as const

export type BoosterTierKey = keyof typeof BOOSTER_TIERS

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
    href: SUI_SENTINEL_AMBASSADOR_URL,
    icon: Handshake,
    isImage: false,
    alt: 'ambassador',
    name: 'Ambassador',
    isOutside: true,
  },
  {
    href: SUI_SENTINEL_AUDIT_REPORT_URL,
    icon: Shield,
    isImage: false,
    alt: 'Audit Report',
    name: 'Audit Report',
    isOutside: true,
  },
  {
    href: '/pdfs/pitch_deck.pdf',
    icon: Presentation,
    isImage: false,
    alt: 'Pitch Deck',
    name: 'Pitch Deck',
    isOutside: true,
  },
  {
    href: REWARD_CALCULATOR_URL,
    icon: Calculator,
    isImage: false,
    alt: 'Reward Calculator',
    name: 'Reward Calculator',
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
  'amazon bedrock': [
    'mistral.mistral-large-3-675b-instruct',
    'openai.gpt-oss-120b-1:0',
    'us.meta.llama4-maverick-17b-instruct-v1:0',
    'us.meta.llama3-2-90b-instruct-v1:0',
    'us.meta.llama3-3-70b-instruct-v1:0',
  ],
  custom: [],
}
