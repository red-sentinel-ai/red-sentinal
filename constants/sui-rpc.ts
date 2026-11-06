// Every public Sui JSON-RPC gateway (official fullnodes, PublicNode, BlockVision,
// Suiscan) has sunset the JSON-RPC protocol — the built-in defaults below all
// return "JSON-RPC has been deprecated" for every method. Balance reads now go
// through the official GraphQL endpoint (see lib/sui/graphql-client). Set these
// to a keyed provider that still serves JSON-RPC to restore the full client
// (objects, transaction build/execute, events) without code changes.
export const SUI_RPC_URLS = {
  mainnet: process.env.NEXT_PUBLIC_SUI_RPC_URL_MAINNET || 'https://sui-rpc.publicnode.com',
  testnet: process.env.NEXT_PUBLIC_SUI_RPC_URL_TESTNET || 'https://sui-testnet-rpc.publicnode.com',
} as const

export const SUI_EVENTS_RPC_URLS = {
  mainnet: process.env.NEXT_PUBLIC_SUI_EVENTS_RPC_URL_MAINNET || 'https://rpc-mainnet.suiscan.xyz',
  testnet: process.env.NEXT_PUBLIC_SUI_EVENTS_RPC_URL_TESTNET || 'https://rpc-testnet.suiscan.xyz',
} as const
