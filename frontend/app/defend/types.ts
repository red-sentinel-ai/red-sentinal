// Types shared across chain-specific deploy hooks and the defend flow

// Result returned after a successful on-chain agent registration transaction
export interface DeployTransactionResult {
  objectId: string // Agent object ID (Sui) or PDA address (Solana)
  digest: string // Transaction hash/signature
}

// Interface that each chain-specific deploy hook must implement
export interface ChainDeployHook {
  walletAddress: string | null
  executeTransaction: (teeResponse: any) => Promise<DeployTransactionResult>
}

// Sui TEE response shape (from tee.suisentinel.xyz)
export interface SuiTeeResponse {
  response: {
    timestamp_ms: number
    data: {
      agent_id: string
      cost_per_message: number
      system_prompt: string
    }
  }
  signature: string
}

// Solana TEE response shape (from tee-solana.suisentinel.xyz)
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
