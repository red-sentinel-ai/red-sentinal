import { createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'
import { defineChain } from 'viem'
import { bsc, bscTestnet, arbitrum, arbitrumSepolia, monad, monadTestnet } from 'viem/chains'
import { APP_NETWORK } from '@/constants/shared'

export const botChainTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
  },
  blockExplorers: {
    default: { name: 'BOTScan', url: 'https://scan.bohr.life' },
  },
  testnet: true,
})

export const botChainMainnet = defineChain({
  id: 677,
  name: 'BOT Chain',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.botchain.ai',
        'https://rpc.kfeeswwz.cn',
        'https://rpc.amdixawp.cn',
        'https://rpc.jnhkpbxr.cn',
        'https://rpc.rpynemmx.cn',
        'https://rpc.kzrmeznc.cn',
      ],
    },
  },
  blockExplorers: {
    default: { name: 'BOTScan', url: 'https://scan.botchain.ai' },
  },
})

// Every supported EVM chain is exposed to the wallet, ordered so the chains
// matching this build's APP_NETWORK come first. Array literals are kept inline
// so createConfig infers the required non-empty tuple type. Connectors are
// driven by Privy — this config only declares chains + transports.
export const wagmiConfig = createConfig({
  chains:
    APP_NETWORK === 'testnet'
      ? [
          bscTestnet,
          botChainTestnet,
          arbitrumSepolia,
          monadTestnet,
          bsc,
          botChainMainnet,
          arbitrum,
          monad,
        ]
      : [
          bsc,
          botChainMainnet,
          arbitrum,
          monad,
          bscTestnet,
          botChainTestnet,
          arbitrumSepolia,
          monadTestnet,
        ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [botChainMainnet.id]: http(),
    [botChainTestnet.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [monad.id]: http(),
    [monadTestnet.id]: http(),
  },
})
