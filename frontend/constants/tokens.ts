import { APP_NETWORK, type SupportedToken } from './shared'
import { NATIVE_SOL_MINT } from './solana'
import { NATIVE_TOKEN_ADDRESS, isNativeToken } from '@/lib/evm/native-token'

export const SUI_COIN_TYPE = '0x2::sui::SUI'
export const SENTINEL_TOKEN_DECIMALS = 0

const NATIVE_TOKEN_MINIMUM_AMOUNT = 0.01

// ─── Sui tokens ──────────────────────────────────────────────────────────────

export const SUI_TOKEN: SupportedToken = {
  symbol: 'SUI',
  name: 'Sui',
  coinType: SUI_COIN_TYPE,
  decimals: 9,
  icon: '/icons/tokens/sui.png',
  minimumAmount: 5,
}

export const TESTNET_SUPPORTED_TOKENS: SupportedToken[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    coinType: '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
    decimals: 6,
    icon: '/icons/tokens/usdc.png',
    minimumAmount: 20,
  },
  SUI_TOKEN,
]

export const MAINNET_SUPPORTED_TOKENS: SupportedToken[] = [
  { ...SUI_TOKEN, minimumAmount: 20 },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    coinType: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    decimals: 6,
    icon: '/icons/tokens/usdc.png',
    minimumAmount: 20,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    coinType: '0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT',
    decimals: 6,
    icon: '/icons/tokens/usdt.png',
    minimumAmount: 20,
  },
  {
    symbol: 'MAGMA',
    name: 'Magma',
    coinType: '0x9f854b3ad20f8161ec0886f15f4a1752bf75d22261556f14cc8d3a1c5d50e529::magma::MAGMA',
    decimals: 9,
    icon: '/icons/tokens/magma.png',
    minimumAmount: 385,
  },
  {
    symbol: 'USDSUI',
    name: 'USD SUI',
    coinType: '0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI',
    decimals: 6,
    icon: '/icons/tokens/usdsui.png',
    minimumAmount: 20,
  },
  {
    symbol: 'DEEP',
    name: 'DeepBook',
    coinType: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
    decimals: 6,
    icon: '/icons/tokens/deep.png',
    minimumAmount: 1667,
  },
  {
    symbol: 'WAL',
    name: 'Walrus',
    coinType: '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL',
    decimals: 9,
    icon: '/icons/tokens/wal.png',
    minimumAmount: 625,
  },
  {
    symbol: 'XBTC',
    name: 'Wrapped BTC',
    coinType: '0x876a4b7bce8aeaef60464c11f4026903e9afacab79b9b142686158aa86560b50::xbtc::XBTC',
    decimals: 8,
    icon: '/icons/tokens/xbtc.png',
    minimumAmount: 20,
  },
  {
    symbol: 'SENTINEL',
    name: 'Sentinel',
    coinType:
      '0x66aaa74fecd25cb19b7576e101b25fd3a844e6b9f678421429d0d49d55e0fca0::sentinel::SENTINEL',
    decimals: SENTINEL_TOKEN_DECIMALS,
    icon: '/icons/tokens/sentinel.png',
    minimumAmount: 100000,
  },
  {
    symbol: 'BLUE',
    name: 'Blue',
    coinType: '0xe1b45a0e641b9955a20aa0ad1c1f4ad86aad8afb07296d4085e349a50e90bdca::blue::BLUE',
    decimals: 9,
    icon: '/icons/tokens/blue.png',
    minimumAmount: 2942,
  },
  {
    symbol: 'CETUS',
    name: 'Cetus Protocol',
    coinType: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
    decimals: 9,
    icon: '/icons/tokens/cetus.png',
    minimumAmount: 2000,
  },
  {
    symbol: 'BUCK',
    name: 'Bucket USD',
    coinType: '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK',
    decimals: 9,
    icon: '/icons/tokens/buck.png',
    minimumAmount: 20,
  },
  {
    symbol: 'stSUI',
    name: 'Staked SUI',
    coinType: '0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI',
    decimals: 9,
    icon: '/icons/tokens/stsui.png',
    minimumAmount: 20,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    coinType: '0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH',
    decimals: 8,
    icon: '/icons/tokens/eth.png',
    minimumAmount: 0.025,
  },
]

export const SUPPORTED_TOKENS: SupportedToken[] =
  APP_NETWORK === 'mainnet' ? MAINNET_SUPPORTED_TOKENS : TESTNET_SUPPORTED_TOKENS

// ─── Solana tokens ───────────────────────────────────────────────────────────

export const SOL_TOKEN: SupportedToken = {
  symbol: 'SOL',
  name: 'Solana',
  coinType: NATIVE_SOL_MINT,
  decimals: 9,
  icon: '/icons/tokens/sol.png',
  minimumAmount: 0.001,
}

export const USDC_DEVNET_TOKEN: SupportedToken = {
  symbol: 'USDC',
  name: 'USD Coin',
  coinType: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  decimals: 6,
  icon: '/icons/tokens/usdc.png',
  minimumAmount: 0.1,
}

export const USDC_MAINNET_TOKEN: SupportedToken = {
  symbol: 'USDC',
  name: 'USD Coin',
  coinType: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  decimals: 6,
  icon: '/icons/tokens/usdc.png',
  minimumAmount: 1,
}

export const SOLANA_DEVNET_SUPPORTED_TOKENS: SupportedToken[] = [SOL_TOKEN, USDC_DEVNET_TOKEN]

export const SOLANA_MAINNET_SUPPORTED_TOKENS: SupportedToken[] = [
  { ...SOL_TOKEN, minimumAmount: 0.001 },
  USDC_MAINNET_TOKEN,
]

export const SOLANA_SUPPORTED_TOKENS: SupportedToken[] =
  APP_NETWORK === 'mainnet' ? SOLANA_MAINNET_SUPPORTED_TOKENS : SOLANA_DEVNET_SUPPORTED_TOKENS

// ─── EVM tokens ──────────────────────────────────────────────────────────────

const WBNB_TESTNET_ADDRESS = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd' as `0x${string}`
const WBNB_MAINNET_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' as `0x${string}`

export const WBNB_TOKEN: SupportedToken = {
  symbol: 'WBNB',
  name: 'Wrapped BNB',
  coinType: APP_NETWORK === 'testnet' ? WBNB_TESTNET_ADDRESS : WBNB_MAINNET_ADDRESS,
  decimals: 18,
  icon: '/icons/tokens/bnb.png',
  minimumAmount: 0.01,
}

const USDC_TESTNET_ADDRESS = '0x64544969ed7EBf5f083679233325356EbE738930' as `0x${string}`
const USDC_MAINNET_ADDRESS = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as `0x${string}`

export const USDC_TOKEN: SupportedToken = {
  symbol: 'USDC',
  name: 'USD Coin',
  coinType: APP_NETWORK === 'testnet' ? USDC_TESTNET_ADDRESS : USDC_MAINNET_ADDRESS,
  decimals: 18,
  icon: '/icons/tokens/usdc.png',
  minimumAmount: 0.01,
}

export const BNB_TOKEN: SupportedToken = {
  symbol: 'BNB',
  name: 'BNB',
  coinType: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
  icon: '/icons/tokens/bnb.png',
  minimumAmount: NATIVE_TOKEN_MINIMUM_AMOUNT,
}

export const EVM_SUPPORTED_TOKENS: SupportedToken[] = [BNB_TOKEN, USDC_TOKEN]

export const BOT_TOKEN: SupportedToken = {
  symbol: 'BOT',
  name: 'BOT',
  coinType: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
  icon: '/icons/tokens/bot.png',
  minimumAmount: NATIVE_TOKEN_MINIMUM_AMOUNT,
}

const BOT_CHAIN_TESTNET_USDC_ADDRESS = '0xAA3091862373B4ae9cd25FfC94DeFA4bbC5f59a6' as `0x${string}`

export const BOT_CHAIN_USDC_TOKEN: SupportedToken = {
  symbol: 'USDC',
  name: 'USD Coin',
  coinType: BOT_CHAIN_TESTNET_USDC_ADDRESS,
  decimals: 6,
  icon: '/icons/tokens/usdc.png',
  minimumAmount: 0.01,
}

export const BOT_CHAIN_SUPPORTED_TOKENS: SupportedToken[] =
  APP_NETWORK === 'mainnet' ? [BOT_TOKEN] : [BOT_TOKEN, BOT_CHAIN_USDC_TOKEN]

export const ARB_TOKEN: SupportedToken = {
  symbol: 'ETH',
  name: 'Ethereum',
  coinType: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
  icon: '/chain-logos/arb.svg',
  minimumAmount: NATIVE_TOKEN_MINIMUM_AMOUNT,
}

const ARB_SEPOLIA_USDC_ADDRESS = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d' as `0x${string}`

export const ARB_USDC_TOKEN: SupportedToken = {
  symbol: 'USDC',
  name: 'USD Coin',
  coinType: ARB_SEPOLIA_USDC_ADDRESS,
  decimals: 6,
  icon: '/icons/tokens/usdc.png',
  minimumAmount: 0.01,
}

export const ARB_SUPPORTED_TOKENS: SupportedToken[] = [ARB_TOKEN, ARB_USDC_TOKEN]

export const MONAD_TOKEN: SupportedToken = {
  symbol: 'MON',
  name: 'Monad',
  coinType: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
  icon: '/chain-logos/mon.webp',
  minimumAmount: NATIVE_TOKEN_MINIMUM_AMOUNT,
}

const MONAD_TESTNET_USDC_ADDRESS = '0x534b2f3A21130d7a60830c2Df862319e593943A3' as `0x${string}`

export const MONAD_USDC_TOKEN: SupportedToken = {
  symbol: 'USDC',
  name: 'USD Coin',
  coinType: MONAD_TESTNET_USDC_ADDRESS,
  decimals: 6,
  icon: '/icons/tokens/usdc.png',
  minimumAmount: 0.01,
}

export const MONAD_SUPPORTED_TOKENS: SupportedToken[] = [MONAD_TOKEN, MONAD_USDC_TOKEN]

// ─── Chain-aware token helpers ───────────────────────────────────────────────

import { CHAINS, type SupportedChain } from './chains'

export function getSupportedTokens(chain: SupportedChain): SupportedToken[] {
  switch (chain) {
    case 'sui':
      return SUPPORTED_TOKENS
    case 'solana':
      return SOLANA_SUPPORTED_TOKENS
    case 'bnb':
      return EVM_SUPPORTED_TOKENS
    case 'bot':
      return BOT_CHAIN_SUPPORTED_TOKENS
    case 'arb':
      return ARB_SUPPORTED_TOKENS
    case 'monad':
      return MONAD_SUPPORTED_TOKENS
    default:
      return SUPPORTED_TOKENS
  }
}

export function getNativeToken(chain: SupportedChain): SupportedToken {
  switch (chain) {
    case 'sui':
      return SUI_TOKEN
    case 'solana':
      return SOL_TOKEN
    case 'bnb':
      return BNB_TOKEN
    case 'bot':
      return BOT_TOKEN
    case 'arb':
      return ARB_TOKEN
    case 'monad':
      return MONAD_TOKEN
    default:
      return SUI_TOKEN
  }
}

export const ALL_SUPPORTED_TOKENS: SupportedToken[] = Object.values(CHAINS).flatMap(c =>
  getSupportedTokens(c.id)
)

export function getTokenForCoinType(
  coinType: string | undefined,
  chainHint?: SupportedChain
): SupportedToken {
  if (!coinType || isNativeToken(coinType)) return getNativeToken(chainHint ?? 'sui')
  const candidates = chainHint ? getSupportedTokens(chainHint) : ALL_SUPPORTED_TOKENS
  const found = candidates.find(
    t => t.coinType === coinType || t.coinType.toLowerCase() === coinType.toLowerCase()
  )
  return found ?? getNativeToken(chainHint ?? 'sui')
}
