import type { PublicClient } from 'viem'

// Arbitrum (Sepolia 421614, One 42161). MetaMask prepares its own fee for these
// networks and lands maxFeePerGas right at/below the base fee, so a tx fails with
// "max fee per gas less than block base fee" whenever the base fee drifts up a
// little between estimation and submission. We override that by passing explicit
// fees computed from the live base fee with generous headroom — MetaMask honors
// dapp-supplied gas params.
const ARBITRUM_CHAIN_IDS = new Set([421614, 42161])

// Multiple of the current base fee to use as the fee cap. The observed drift is
// tiny (~0.1%), but two sequential txs (approve → register) plus a slow public
// RPC warrant a wide margin. Arbitrum gas is cheap, so over-provisioning the cap
// is harmless — you're only ever charged the actual base fee.
const BASE_FEE_MULTIPLIER = 3n

// Small tip on top of the base fee. Arbitrum's sequencer largely ignores the
// priority fee, but a non-zero value keeps wallets/RPCs happy.
const PRIORITY_FEE_WEI = 1_000_000n // 0.001 gwei

export type EvmFeeOverrides = {
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

/**
 * Returns explicit EIP-1559 fee overrides for Arbitrum writes, or an empty
 * object for every other chain (so BNB/BOT keep the wallet's default behavior).
 * Pass the result by spreading it into a wagmi `writeContractAsync` call, and
 * re-fetch right before each tx in a multi-step flow since the base fee drifts.
 */
export async function getEvmFeeOverrides(
  chainId: number | undefined,
  publicClient: PublicClient | undefined
): Promise<EvmFeeOverrides> {
  if (!chainId || !ARBITRUM_CHAIN_IDS.has(chainId) || !publicClient) return {}

  const block = await publicClient.getBlock({ blockTag: 'latest' })
  const baseFee = block.baseFeePerGas
  if (baseFee == null || baseFee === 0n) return {}

  return {
    maxFeePerGas: baseFee * BASE_FEE_MULTIPLIER + PRIORITY_FEE_WEI,
    maxPriorityFeePerGas: PRIORITY_FEE_WEI,
  }
}
