// No single public Sui RPC serves everything this app needs, so we keep two.
//
// Sui's own public fullnodes (getFullnodeUrl) have DISABLED JSON-RPC entirely —
// every method returns "Method not found. JSON-RPC on public fullnodes has been
// deprecated" — so they cannot back the JSON-RPC SuiClient this app uses.
//
// Object/coin reads and transaction execution (the attack hot path) go to
// publicnode: it absorbed 5 concurrent attack bursts with zero 429s, where
// BlockVision throttles hard enough that retrying cannot recover.
//
// Historical events are the exception — publicnode prunes them and answers
// "Could not find the referenced transaction events", so suix_queryEvents has to
// go to BlockVision, the only endpoint tested that still serves them. Event
// queries are rare and cached, so the throttling there is tolerable.
//
// These are inlined at build time — the vars must exist before `next build`.
export const SUI_RPC_URLS = {
  mainnet: process.env.NEXT_PUBLIC_SUI_RPC_URL_MAINNET || 'https://sui-rpc.publicnode.com',
  testnet: process.env.NEXT_PUBLIC_SUI_RPC_URL_TESTNET || 'https://sui-testnet-rpc.publicnode.com',
} as const

export const SUI_EVENTS_RPC_URLS = {
  mainnet:
    process.env.NEXT_PUBLIC_SUI_EVENTS_RPC_URL_MAINNET ||
    'https://sui-mainnet-endpoint.blockvision.org',
  testnet:
    process.env.NEXT_PUBLIC_SUI_EVENTS_RPC_URL_TESTNET ||
    'https://sui-testnet-endpoint.blockvision.org',
} as const
