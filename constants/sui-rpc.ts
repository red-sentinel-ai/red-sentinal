export const SUI_RPC_URLS = {
  mainnet: process.env.NEXT_PUBLIC_SUI_RPC_URL_MAINNET || 'https://sui-rpc.publicnode.com',
  testnet: process.env.NEXT_PUBLIC_SUI_RPC_URL_TESTNET || 'https://sui-testnet-rpc.publicnode.com',
} as const

export const SUI_EVENTS_RPC_URLS = {
  mainnet:
    process.env.NEXT_PUBLIC_SUI_EVENTS_RPC_URL_MAINNET ||
    'https://rpc-mainnet.suiscan.xyz',
  testnet:
    process.env.NEXT_PUBLIC_SUI_EVENTS_RPC_URL_TESTNET ||
    'https://rpc-testnet.suiscan.xyz',
} as const
