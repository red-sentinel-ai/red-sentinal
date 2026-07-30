'use client'

import { useState } from 'react'
import { CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useEvmChain } from '@/hooks/evm/useEvmChain'
import { SyndicateStepper } from './SyndicateStepper'
import { SyndicateStep1 } from './SyndicateStep1'
import { SyndicateStep2 } from './SyndicateStep2'
import { SyndicateStep3 } from './SyndicateStep3'
import type { SupportedToken } from '@/constants/shared'

interface DeployedInfo {
  contractAddress: `0x${string}`
  tokenAddress: `0x${string}`
  tokenSymbol: string
  tokenDecimals: number
  syndicateName: string
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '_')
}

export function SyndicateLaunchFlow() {
  const { evmConfig } = useEvmChain()
  const [step, setStep] = useState(1)
  const [deployedInfo, setDeployedInfo] = useState<DeployedInfo | null>(null)
  const [depositedAmount, setDepositedAmount] = useState('')
  const [launchedAgentId, setLaunchedAgentId] = useState<string | null>(null)
  const [launchedAgentName, setLaunchedAgentName] = useState<string | null>(null)
  const [launchedTxHash, setLaunchedTxHash] = useState<string | null>(null)

  const handleStep1Complete = (result: DeployedInfo) => {
    setDeployedInfo(result)
    setStep(2)
  }

  const handleStep2Complete = (amount: string) => {
    setDepositedAmount(amount)
    setStep(3)
  }

  const handleStep3Complete = (agentId: string, txHash: string, agentName: string) => {
    setLaunchedAgentId(agentId)
    setLaunchedAgentName(agentName)
    setLaunchedTxHash(txHash)
    setStep(4)
  }

  const selectedToken: SupportedToken | null = deployedInfo
    ? {
        symbol: deployedInfo.tokenSymbol,
        name: deployedInfo.tokenSymbol,
        coinType: deployedInfo.tokenAddress,
        decimals: deployedInfo.tokenDecimals,
        icon: '',
        minimumAmount: 0.01,
      }
    : null

  if (step === 4 && deployedInfo && launchedAgentId) {
    const syndicatePath = `/syndicate/${slugify(deployedInfo.syndicateName)}`
    const agentPath = launchedAgentName
      ? `/attack/${slugify(launchedAgentName)}`
      : `/agent/${launchedAgentId}`

    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <CheckCircle className="h-16 w-16 text-[var(--color-gold-primary)]" />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Syndicate Sentinel Launched!
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Your syndicate is live and the sentinel is protecting the bounty pool.
          </p>
        </div>

        <div className="w-full space-y-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)]">Syndicate</span>
            <Link
              href={syndicatePath}
              className="font-mono text-xs text-[var(--color-gold-primary)] hover:underline"
            >
              {deployedInfo.contractAddress.slice(0, 10)}...{deployedInfo.contractAddress.slice(-8)}
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)]">Sentinel ID</span>
            <span className="font-mono text-xs text-[var(--color-text-secondary)]">
              {launchedAgentId.slice(0, 12)}...
            </span>
          </div>
          {launchedTxHash && evmConfig && (
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)]">Transaction</span>
              <a
                href={`${evmConfig.explorerUrl}/tx/${launchedTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[var(--color-gold-primary)] hover:underline"
              >
                View <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        <div className="flex w-full gap-3">
          <Link
            href={syndicatePath}
            className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)]"
          >
            Manage Syndicate
          </Link>
          <Link
            href={agentPath}
            className="flex h-10 flex-1 items-center justify-center rounded-lg border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-gold-primary)]"
          >
            View Sentinel
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <SyndicateStepper currentStep={step} />

      <div>
        {step === 1 && <SyndicateStep1 onComplete={handleStep1Complete} />}
        {step === 2 && deployedInfo && (
          <SyndicateStep2
            syndicateAddress={deployedInfo.contractAddress}
            tokenAddress={deployedInfo.tokenAddress}
            tokenSymbol={deployedInfo.tokenSymbol}
            tokenDecimals={deployedInfo.tokenDecimals}
            onComplete={handleStep2Complete}
          />
        )}
        {step === 3 && deployedInfo && selectedToken && (
          <SyndicateStep3
            syndicateAddress={deployedInfo.contractAddress}
            selectedToken={selectedToken}
            availableBalance={depositedAmount}
            onComplete={handleStep3Complete}
          />
        )}
      </div>
    </div>
  )
}
