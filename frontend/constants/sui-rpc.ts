export const SUI_RPC_URLS = {
  mainnet:
    process.env.NEXT_PUBLIC_SUI_RPC_URL_MAINNET || 'https://sui-mainnet-endpoint.blockvision.org',
  testnet:
    process.env.NEXT_PUBLIC_SUI_RPC_URL_TESTNET || 'https://sui-testnet-endpoint.blockvision.org',
} as const
