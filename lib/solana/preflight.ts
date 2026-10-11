import type { Connection } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, NATIVE_MINT } from '@solana/spl-token'
import { NATIVE_SOL_MINT } from '@/constants/solana'

const LAMPORTS_PER_SOL = 1_000_000_000

// Accounts the deploy flow creates:
//  - agent PDA: 8-byte Anchor discriminator + Agent fields (agent_id stored at
//    its max_len of 32 — sizing to the max keeps the estimate conservative)
//  - two SPL token vaults: standard 165-byte token accounts
const AGENT_ACCOUNT_SIZE = 8 + 4 + 32 + 32 + 32 + 8 + 32 + 8 + 8 + 8 + 1 + 1 + 8 + 1 + 1 + 1 // 185
const TOKEN_ACCOUNT_SIZE = 165

const TX_FEE_LAMPORTS = 5_000n // one signature per transaction
const FEE_MARGIN_LAMPORTS = 10_000n // headroom for fee market movement

function fmtSol(lamports: bigint): string {
  return (Number(lamports) / LAMPORTS_PER_SOL).toFixed(5)
}

/**
 * Throws if the connected wallet cannot cover everything the deploy flow will
 * spend: account rent for the agent PDA and its two vaults, transaction fees,
 * and (for native SOL) the funding amount itself plus a wrapped-SOL ATA.
 * Call this BEFORE calling the TEE so a broke wallet never wastes a signing
 * request or lands a failed transaction on-chain.
 */
export async function assertSolanaDeployFeasible(params: {
  connection: Connection
  wallet: PublicKey
  fundAmountLamports: bigint
  tokenMint: string
  tokenSymbol: string
}): Promise<void> {
  const { connection, wallet, fundAmountLamports, tokenMint, tokenSymbol } = params
  const isNativeSol = tokenMint === NATIVE_SOL_MINT

  const [agentRent, vaultRent, balanceLamports] = await Promise.all([
    connection.getMinimumBalanceForRentExemption(AGENT_ACCOUNT_SIZE),
    connection.getMinimumBalanceForRentExemption(TOKEN_ACCOUNT_SIZE),
    connection.getBalance(wallet),
  ])

  const parts: string[] = [
    `agent account ${fmtSol(BigInt(agentRent))} SOL`,
    `2 vaults ${fmtSol(2n * BigInt(vaultRent))} SOL`,
  ]
  // tx1 (register_agent + init_agent_vaults) + tx2 (fund) — one fee each
  let required = BigInt(agentRent) + 2n * BigInt(vaultRent) + 2n * TX_FEE_LAMPORTS + FEE_MARGIN_LAMPORTS

  if (fundAmountLamports > 0n) {
    if (isNativeSol) {
      const ownerAta = getAssociatedTokenAddressSync(NATIVE_MINT, wallet)
      const ataInfo = await connection.getAccountInfo(ownerAta)
      if (!ataInfo) {
        required += BigInt(vaultRent)
        parts.push(`wSOL ATA ${fmtSol(BigInt(vaultRent))} SOL`)
      }
      required += fundAmountLamports
      parts.push(`${fmtSol(fundAmountLamports)} SOL reward pool`)
    } else {
      const ata = getAssociatedTokenAddressSync(new PublicKey(tokenMint), wallet)
      let tokenBalance = 0n
      try {
        tokenBalance = BigInt((await connection.getTokenAccountBalance(ata)).value.amount)
      } catch {
        tokenBalance = 0n // no token account yet
      }
      if (tokenBalance < fundAmountLamports) {
        throw new Error(
          `Insufficient ${tokenSymbol} balance: funding this Sentinel's reward pool needs ` +
            `${fmtSol(fundAmountLamports)} ${tokenSymbol}, but your wallet only holds ` +
            `${fmtSol(tokenBalance)} ${tokenSymbol}. Add ${tokenSymbol} and try again.`
        )
      }
    }
  }

  if (BigInt(balanceLamports) < required) {
    throw new Error(
      `Insufficient SOL in your wallet: deploying this Sentinel requires about ` +
        `${fmtSol(required)} SOL (${parts.join(' + ')}, plus fees), but your wallet only has ` +
        `${fmtSol(BigInt(balanceLamports))} SOL. Fund your wallet with SOL and try again.`
    )
  }
}
