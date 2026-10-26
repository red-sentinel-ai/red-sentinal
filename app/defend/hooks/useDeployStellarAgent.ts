'use client'

import { useStellarWallet } from '@/hooks/useStellarWallet'
import { STELLAR_CONFIG } from '@/constants/stellar'
import type { DefendFormData } from './useDefendForm'
import type { ChainDeployHook, StellarTeeResponse, DeployTransactionResult } from '../types'

interface UseDeployStellarAgentOptions {
  formData: DefendFormData
}

const XLM_DECIMALS = 7

/**
 * Registers a Sentinel on Stellar: register_agent (enclave-verified) followed
 * by the initial bounty fund when the form has an initial balance. Both calls
 * go through the same assembled contract client; Freighter signs each tx.
 */
export function useDeployStellarAgent({
  formData,
}: UseDeployStellarAgentOptions): ChainDeployHook {
  const { address, signTransaction } = useStellarWallet()

  const executeTransaction = async (
    teeResponse: StellarTeeResponse
  ): Promise<DeployTransactionResult> => {
    if (!address) throw new Error('Stellar wallet not connected')

    const { response: teeData, signature: teeSignature } = teeResponse
    const { data } = teeData

    const signer = { address, signTransaction }
    const { stellarInvoke } = await import('@/lib/stellar/client')

    const registerHash = await stellarInvoke(signer, 'register_agent', {
      creator: address,
      agent_id: data.agent_id,
      // Sentinel agents on Stellar are paid in native XLM via its SAC.
      token: STELLAR_CONFIG.NATIVE_XLM_SAC,
      cost_per_message: BigInt(data.cost_per_message),
      prompt_hash: Uint8Array.from(data.prompt_hash),
      timestamp: BigInt(teeData.timestamp),
      signature: Uint8Array.from(Buffer.from(teeSignature, 'hex')),
    })

    // Fund the bounty pool when the form specifies an initial balance.
    const fundRaw = Math.floor(
      parseFloat(formData.initialBalance || '0') * Math.pow(10, XLM_DECIMALS)
    )
    if (fundRaw > 0) {
      await stellarInvoke(signer, 'fund_agent', {
        owner: address,
        agent_id: data.agent_id,
        amount: BigInt(fundRaw),
      })
    }

    // Stellar has no per-agent object id — the agent id string is the identity.
    return { objectId: data.agent_id, digest: registerHash }
  }

  return {
    walletAddress: address,
    executeTransaction,
  }
}
