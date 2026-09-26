// Types shared across chain-specific deploy hooks and the defend flow

// Result returned after a successful on-chain agent registration transaction
export interface DeployTransactionResult {
  objectId: string // Agent object ID (Sui) or PDA address (Solana)
  digest: string // Transaction hash/signature
}

// Interface that each chain-specific deploy hook must implement
export interface ChainDeployHook {
  walletAddress: string | null
  /** Extra per-deploy options (e.g. Sui's fund-bounty-from-wallet flag). */
  executeTransaction: (teeResponse: any, options?: any) => Promise<DeployTransactionResult>
}

// Sui TEE response shape
export interface SuiTeeResponse {
  response: {
    timestamp: number // Unix seconds — the contract compares against clock/1000
    data: {
      agent_id: string
      cost_per_message: number
      prompt_hash: number[] // 32 bytes (SHA-256 of system prompt)
    }
  }
  signature: string
}

// Solana TEE response shape (from tee-solana.redsentinel.xyz)
export interface SolanaTeeResponse {
  response: {
    intent: number
    timestamp: number // Unix seconds
    data: {
      agent_id: string
      cost_per_message: number
      prompt_hash: number[] // 32 bytes
      is_defeated: boolean
      creator: number[] // 32 bytes (Solana pubkey)
    }
  }
  signature: string // hex-encoded Ed25519 signature (64 bytes)
}

// EVM TEE response shape (from tee-evm.redsentinel.xyz)
export interface EvmTeeResponse {
  response: {
    intent: number
    timestamp: number // milliseconds (i64 in Rust)
    data: {
      agent_id: string
      cost_per_message: number
      prompt_hash: number[] // 32 bytes (SHA-256 of system prompt)
      is_defeated: boolean
      creator: number[] // 20 bytes (EVM address)
    }
  }
  signature: string // hex-encoded secp256k1 r+s (64 bytes, without 0x prefix)
  recovery_id: number // 0 or 1 — append as v = 27 + recovery_id for EVM ECDSA.recover()
}
