export const DEFAULT_RPC_URL = 'https://api.cartridge.gg/x/starknet/sepolia'
// export const RPC_NODE_URL = process.env.NEXT_PUBLIC_RPC_NODE_URL || DEFAULT_RPC_URL
export const RPC_NODE_URL = DEFAULT_RPC_URL
export const AGENT_REGISTRY_ADDRESS =
  '0x6eea1a6fd3fbf870a043f311ad260c0dc6f384f3c869dd4ccfa550c2202bc485'

export const INDEXER_BASE_URL = process.env.NEXT_PUBLIC_INDEXER_BASE_URL || 'http://localhost:4000'

export const supabaseUrl = process.env.SUPABASE_URL || ''
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const SYSTEM_PROMPT_MAX_TOKENS = 800

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

export const TREASURY_ADDRESS = '0xe4e8af19c2943fc2e3cbefa2fca9149985fc3b3c3d9dd312902b2c26dc600d95'
export const LOCAL_API_PATH = 'http://3.92.163.15:3000'

export const SUI_CONFIG = {
  EXAMPLES_PACKAGE_ID: '0xe66533e7317be1f38ba0bdde5b58d000f6330cc06d31c4bbf3f22709eac13001',
  MODULE_NAME: 'sentinel',
  OTW_NAME: 'SENTINEL',
  AGENT_REGISTRY: '0x6eea1a6fd3fbf870a043f311ad260c0dc6f384f3c869dd4ccfa550c2202bc485',
  ENCLAVE_OBJECT_ID: '0xb1eda22ce9f778835f1c14f513a3b849aad3a1f76074839de5cf4b2121f2804e',
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
  TWITTER_FOLLOW: 'https://twitter.com/intent/follow?screen_name=ravenhousenft',
  TWITTER_PROFILE: X_URL,
  TWITTER_TWEET:
    'https://twitter.com/intent/tweet?text=Just%20explored%20@ravenhousenft%20on%20https%3A%2F%2Fapp.ravenhouse.xyz%2F%20%23RavenHouse%20%23NFT%20%23Aztec',
  DISCORD_JOIN: PROJECT_DISCORD_URL,
  DISCORD_GENERAL_CHAT_URL: 'https://discord.com/channels/1344562923569152021/1344638823992393748',
} as const

//TODO: Add the correct docs url
export const REWARDS_DOCS_URL = 'https://sui-sentinal-plum.vercel.app/'
