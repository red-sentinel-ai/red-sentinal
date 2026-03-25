// Single import point for Solana wallet state across the app.
// Components should import from here, not directly from @solana/wallet-adapter-react,
// so swapping the underlying library only requires changes in one place.
export { useWallet as useSolanaWallet, useConnection as useSolanaConnection } from '@solana/wallet-adapter-react'
