'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { Dialog } from '@/components/Dialog'
import { DonateFundsForm } from '@/components/agents/DonateFundsForm'
import { DonateFundsSuccess } from '@/components/agents/DonateFundsSuccess'
import { useDonateToAgentEVM } from '@/hooks/useDonateToAgentEVM'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useActiveChain } from '@/context/ActiveChainContext'
import { getTokenForCoinType } from '@/constants/tokens'
import type { Agent } from '@/types/agents'

interface DonateFundsModalProps {
  open: boolean
  onClose: () => void
  agent: Agent
  /** Called after a confirmed donation so the caller can refresh the bounty. */
  onDonated?: () => void
}

export const DonateFundsModal = ({ open, onClose, agent, onDonated }: DonateFundsModalProps) => {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [hasDonated, setHasDonated] = useState(false)

  const { activeChain, setActiveChain } = useActiveChain()
  const { address: donorAddress } = useConnectedAddress()
  const { donateToAgent, isLoading } = useDonateToAgentEVM()

  const token = getTokenForCoinType(agent.coin_type, agent.chain)
  // Donations go to the contract on the sentinel's own chain, so the app has to
  // be pointed at that chain before the wallet is asked to sign.
  const chainToSwitch = agent.chain && agent.chain !== activeChain ? agent.chain : null

  const handleAmountChange = (nextAmount: string) => {
    setAmount(nextAmount)
    if (error) setError('')
  }

  const validateAmount = (): boolean => {
    const donationAmount = parseFloat(amount)
    if (!amount.trim()) {
      setError('Amount is required')
      return false
    }
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError('Amount must be a positive number')
      return false
    }
    return true
  }

  const handleDonate = async () => {
    if (!validateAmount()) return

    try {
      await donateToAgent({
        agentId: agent.agent_id,
        // token.coinType resolves native gas tokens to the zero address the
        // contract expects, which agent.coin_type may leave undefined.
        tokenAddress: token.coinType,
        amount: +amount,
        decimals: token.decimals,
        symbol: token.symbol,
      })

      posthog.capture('sentinel_donated', {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        amount: parseFloat(amount),
        token_symbol: token.symbol,
        donor_address: donorAddress,
        chain: agent.chain,
      })

      setHasDonated(true)
      setAmount('')
      setError('')
      onDonated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to donate to sentinel')
    }
  }

  const handleClose = () => {
    setAmount('')
    setError('')
    setHasDonated(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      {hasDonated ? (
        <DonateFundsSuccess agentName={agent.agent_name} onClose={handleClose} />
      ) : (
        <DonateFundsForm
          agentName={agent.agent_name}
          token={token}
          amount={amount}
          error={error}
          isSubmitting={isLoading}
          chainToSwitch={chainToSwitch}
          onAmountChange={handleAmountChange}
          onSubmit={handleDonate}
          onSwitchChain={setActiveChain}
          onClose={handleClose}
        />
      )}
    </Dialog>
  )
}
