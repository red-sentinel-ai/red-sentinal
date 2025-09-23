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
export const SUI_SENTINEL_DISCORD_URL = 'https://discord.gg/bAz9g9u69K'
export const SUI_SENTINEL_GITHUB_URL = 'https://github.com/sui-sentinel/contracts'
export const SUI_SENTINEL_TELEGRAM_URL = 'https://t.me/suisentinel'

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
  EXAMPLES_PACKAGE_ID: '0x1d1941cb375a5bdec1c5dd4d9de11799b4e3d0421e24ae9d25835a8287e07981',
  MODULE_NAME: 'sentinel',
  OTW_NAME: 'SENTINEL',
  AGENT_REGISTRY: '0x5de3a56d697e26beb3495a6dbd2378dc71e80d95a4a628b53f7dc0cd5fd97ae0',
  ENCLAVE_OBJECT_ID: '0x7fcfd0d0f3e1d6380b083fbf271fe8750e8f1270b1c4cf1bec5894b65f1a958d',
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
export const REWARDS_DOCS_URL = 'https://sui-sentinal-plum.vercel.app/'
export const SENTINEL_GIFS = [
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//6.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//7.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//8.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//9.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//10.png',
]

export const SENTINEL_IMAGES = [
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//1.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//2.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//3.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//4.png',
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/builder_nfts//5.png',
]
