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

export const LOCAL_API_PATH = 'http://52.23.169.62:3000'

export const SUI_CONFIG = {
  EXAMPLES_PACKAGE_ID: '0x1dab98ff24286c8c919cb74c59fb8f4ade7b217bc6dd0e90cf62c34b135cf0e1',
  MODULE_NAME: 'sentinel',
  OTW_NAME: 'SENTINEL',
  AGENT_REGISTRY: '0x88223076715dd9372db77670628beba42be2866d80070cd1cc2368b5253e5483',
  ENCLAVE_OBJECT_ID: '0x69a2b2da075054115872168cc1ca2c8c96d88028bba5e57065ee6af4115274a3',
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

export const DEFAULT_PROFILE_URL =
  'https://oqymtqolwjujkayjyxdt.supabase.co/storage/v1/object/public/ss-agents//default_profile.jpg'
