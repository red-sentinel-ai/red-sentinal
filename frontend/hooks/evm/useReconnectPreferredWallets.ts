'use client'

import { useEffect } from 'react'
import { reconnect } from '@wagmi/core'
import type { Connector } from 'wagmi'
import { wagmiConfig } from '@/lib/wagmi'

function isPhantomConnector(connector: Connector): boolean {
  return `${connector.id} ${connector.name}`.toLowerCase().includes('phantom')
}

export function useReconnectPreferredWallets() {
  useEffect(() => {
    const reconnectableConnectors = wagmiConfig.connectors.filter(
      connector => !isPhantomConnector(connector)
    )

    reconnect(wagmiConfig, { connectors: [...reconnectableConnectors] })
  }, [])
}
