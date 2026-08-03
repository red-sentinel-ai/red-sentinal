'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { getWalletClient, waitForTransactionReceipt } from '@wagmi/core'
import { wagmiConfig } from '@/lib/wagmi'
import { SYNDICATE_ABI, SYNDICATE_BYTECODE } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { SUI_SENTINEL_API_URL } from '@/constants'
import { APP_NETWORK } from '@/constants/shared'
import { useEvmChain } from '@/hooks/evm/useEvmChain'

export interface DeploySyndicateParams {
  name: string
  description: string
  socialLink: string
  tokenAddress: `0x${string}`
  tokenSymbol: string
  whitelistEnabled: boolean
}

export interface DeployedSyndicate {
  contractAddress: `0x${string}`
  txHash: `0x${string}`
}

export function useDeploySyndicate() {
  const { address: walletAddress } = useAccount()
  const { evmConfig, ensureWalletOnActiveChain } = useEvmChain()
  const [isDeploying, setIsDeploying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deploy = async (params: DeploySyndicateParams): Promise<DeployedSyndicate> => {
    if (!walletAddress) throw new Error('EVM wallet not connected')

    setIsDeploying(true)
    setError(null)

    try {
      const targetChainId = await ensureWalletOnActiveChain()
      if (!evmConfig) throw new Error('No EVM chain is selected')

      const walletClient = await getWalletClient(wagmiConfig, { chainId: targetChainId })
      if (!walletClient) throw new Error('EVM wallet not connected')

      const txHash = await walletClient.deployContract({
        abi: SYNDICATE_ABI,
        bytecode: SYNDICATE_BYTECODE,
        args: [
          evmConfig.contractAddress,
          params.tokenAddress,
          walletAddress,
          params.whitelistEnabled,
        ],
        chain: walletClient.chain,
        account: walletAddress,
      } as any)

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
        chainId: targetChainId,
      })

      if (!receipt.contractAddress) throw new Error('Contract deployment failed: no address returned')

      // Save metadata to backend
      await fetch(`${SUI_SENTINEL_API_URL}/syndicates/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_address: receipt.contractAddress,
          owner: walletAddress,
          name: params.name,
          description: params.description,
          social_link: params.socialLink || null,
          token_address: params.tokenAddress,
          token_symbol: params.tokenSymbol,
          whitelist_enabled: params.whitelistEnabled,
          network: APP_NETWORK,
        }),
      })

      return { contractAddress: receipt.contractAddress as `0x${string}`, txHash }
    } catch (err) {
      const msg = toReadableEvmError(err, 'Deploy failed')
      setError(msg)
      throw new Error(msg)
    } finally {
      setIsDeploying(false)
    }
  }

  return { deploy, isDeploying, error }
}
