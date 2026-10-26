import { APP_NETWORK } from './shared'

/**
 * Stellar (Soroban) chain configuration — mirrors constants/solana.ts and
 * constants/evm.ts. The contract is deployed per network; an empty
 * CONTRACT_ID means "not deployed yet" so UI flows can skip gracefully.
 */

export interface StellarChainConfig {
  CONTRACT_ID: string
  RPC_URL: string
  HORIZON_URL: string
  /** StrKey network passphrase the wallet must sign with. */
  NETWORK_PASSPHRASE: string
  EXPLORER_URL: string
  /**
   * Native XLM wrapped as a SAC (Stellar Asset Contract). The contract takes a
   * token contract address per agent; agents paid in XLM use this address.
   */
  NATIVE_XLM_SAC: string
}

// The native-asset SAC has a fixed address per network (derived from the
// issuer-less `native` asset). Testnet value verified on-chain.
const NATIVE_XLM_SAC_TESTNET = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
// TODO: confirm after mainnet deployment (same derivation, different network id).
const NATIVE_XLM_SAC_MAINNET = 'CAS3J7GYALXTE2U3KOLVRE23DGBWC3ICL6UOXTZOIEHDZW6B4SBEFSSV'

export const STELLAR_TESTNET_CONFIG: StellarChainConfig = {
  CONTRACT_ID:
    process.env.NEXT_PUBLIC_STELLAR_TESTNET_CONTRACT_ID ??
    'CBJ6XDS76GYHL6KJCE2W5V7Z4ZFW2TSPL5BE7WDNKMQ4VDVLLBJIOMFM',
  RPC_URL: process.env.NEXT_PUBLIC_STELLAR_TESTNET_RPC_URL ?? 'https://soroban-testnet.stellar.org',
  HORIZON_URL: 'https://horizon-testnet.stellar.org',
  NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
  EXPLORER_URL: 'https://stellar.expert/explorer/testnet',
  NATIVE_XLM_SAC: NATIVE_XLM_SAC_TESTNET,
}

export const STELLAR_MAINNET_CONFIG: StellarChainConfig = {
  // Set once the Sentinel contract is deployed to Stellar mainnet.
  CONTRACT_ID: process.env.NEXT_PUBLIC_STELLAR_MAINNET_CONTRACT_ID ?? '',
  RPC_URL: process.env.NEXT_PUBLIC_STELLAR_MAINNET_RPC_URL ?? 'https://soroban-rpc.stellar.org',
  HORIZON_URL: 'https://horizon.stellar.org',
  NETWORK_PASSPHRASE: 'Public Global Stellar Network ; September 2015',
  EXPLORER_URL: 'https://stellar.expert/explorer/mainnet',
  NATIVE_XLM_SAC: NATIVE_XLM_SAC_MAINNET,
}

export const STELLAR_CONFIG =
  APP_NETWORK === 'mainnet' ? STELLAR_MAINNET_CONFIG : STELLAR_TESTNET_CONFIG

/** Network slug the TEE service routes by (mirrors sui-testnet / solana-testnet). */
export const STELLAR_TEE_NETWORK = APP_NETWORK === 'mainnet' ? 'stellar-mainnet' : 'stellar-testnet'

/** Sentinel agents on Stellar are paid in XLM (the only wired token for now). */
export const XLM_COIN_TYPE = 'XLM'
