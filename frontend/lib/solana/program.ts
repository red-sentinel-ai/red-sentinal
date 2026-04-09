import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Ed25519Program,
  type Connection,
} from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SOLANA_CONFIG } from '@/constants/solana'
import { sha256 } from './utils'

// Anchor instruction discriminators: sha256("global:<name>")[0..8]
let discriminatorCache: Record<string, Buffer> | null = null

async function getDiscriminators() {
  if (discriminatorCache) return discriminatorCache
  const [registerAgent, initAgentVaults, fundAgent] = await Promise.all([
    sha256('global:register_agent'),
    sha256('global:init_agent_vaults'),
    sha256('global:fund_agent'),
  ])
  discriminatorCache = {
    registerAgent: Buffer.from(registerAgent.slice(0, 8)),
    initAgentVaults: Buffer.from(initAgentVaults.slice(0, 8)),
    fundAgent: Buffer.from(fundAgent.slice(0, 8)),
  }
  return discriminatorCache
}

function getProgramId(): PublicKey {
  return new PublicKey(SOLANA_CONFIG.PROGRAM_ID)
}

// PDA derivations
export function deriveProtocolConfigPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('protocol_config')],
    getProgramId()
  )
  return pda
}

export function deriveAgentPda(agentId: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('agent'), Buffer.from(agentId)],
    getProgramId()
  )
  return pda
}

export function deriveAgentVaultPda(agentPda: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('agent_vault'), agentPda.toBuffer()],
    getProgramId()
  )
  return pda
}

export function deriveAgentFeesVaultPda(agentPda: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('agent_fees'), agentPda.toBuffer()],
    getProgramId()
  )
  return pda
}

// Borsh serialization helpers
function encodeString(s: string): Buffer {
  const strBuf = Buffer.from(s, 'utf-8')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32LE(strBuf.length, 0)
  return Buffer.concat([lenBuf, strBuf])
}

function encodeU64(n: bigint): Buffer {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64LE(n, 0)
  return buf
}

function encodeI64(n: bigint): Buffer {
  const buf = Buffer.alloc(8)
  buf.writeBigInt64LE(n, 0)
  return buf
}

function encodeBytes(bytes: Uint8Array): Buffer {
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32LE(bytes.length, 0)
  return Buffer.concat([lenBuf, Buffer.from(bytes)])
}

function encodeFixedArray(bytes: Uint8Array): Buffer {
  return Buffer.from(bytes)
}

// Build register_agent instruction
export async function buildRegisterAgentInstruction(params: {
  agentId: string
  costPerMessage: bigint
  promptHash: Uint8Array // 32 bytes
  timestamp: bigint // seconds
  signature: Uint8Array // 64 bytes
  tokenMint: PublicKey
  creator: PublicKey
}): Promise<TransactionInstruction> {
  const discriminators = await getDiscriminators()
  const programId = getProgramId()

  const protocolConfigPda = deriveProtocolConfigPda()
  const agentPda = deriveAgentPda(params.agentId)

  const data = Buffer.concat([
    discriminators.registerAgent,
    encodeString(params.agentId),
    encodeU64(params.costPerMessage),
    encodeFixedArray(params.promptHash),
    encodeI64(params.timestamp),
    encodeBytes(params.signature),
  ])

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: protocolConfigPda, isSigner: false, isWritable: false },
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: params.tokenMint, isSigner: false, isWritable: false },
      { pubkey: params.creator, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
    ],
    data,
  })
}

// Build init_agent_vaults instruction
export async function buildInitAgentVaultsInstruction(params: {
  agentId: string
  tokenMint: PublicKey
  payer: PublicKey
}): Promise<TransactionInstruction> {
  const discriminators = await getDiscriminators()
  const programId = getProgramId()

  const agentPda = deriveAgentPda(params.agentId)
  const agentVaultPda = deriveAgentVaultPda(agentPda)
  const agentFeesVaultPda = deriveAgentFeesVaultPda(agentPda)

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: params.tokenMint, isSigner: false, isWritable: false },
      { pubkey: agentVaultPda, isSigner: false, isWritable: true },
      { pubkey: agentFeesVaultPda, isSigner: false, isWritable: true },
      { pubkey: params.payer, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: discriminators.initAgentVaults,
  })
}

// Build fund_agent instruction
export async function buildFundAgentInstruction(params: {
  agentId: string
  amount: bigint
  ownerTokenAccount: PublicKey
  owner: PublicKey
}): Promise<TransactionInstruction> {
  const discriminators = await getDiscriminators()
  const programId = getProgramId()

  const agentPda = deriveAgentPda(params.agentId)
  const agentVaultPda = deriveAgentVaultPda(agentPda)

  const data = Buffer.concat([discriminators.fundAgent, encodeU64(params.amount)])

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: agentVaultPda, isSigner: false, isWritable: true },
      { pubkey: params.ownerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: params.owner, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  })
}

// Build Ed25519 pre-instruction for signature verification
export function buildEd25519VerifyInstruction(params: {
  enclavePubkey: Uint8Array // 32 bytes
  message: Uint8Array
  signature: Uint8Array // 64 bytes
}): TransactionInstruction {
  return Ed25519Program.createInstructionWithPublicKey({
    publicKey: params.enclavePubkey,
    message: params.message,
    signature: params.signature,
  })
}

// Fetch the enclave public key from the on-chain ProtocolConfig account
export async function fetchEnclavePubkey(connection: Connection): Promise<Uint8Array> {
  const protocolConfigPda = deriveProtocolConfigPda()
  const accountInfo = await connection.getAccountInfo(protocolConfigPda)
  if (!accountInfo) throw new Error('Protocol config account not found on Solana')

  // Parse ProtocolConfig account data (Anchor 8-byte discriminator + fields)
  // Layout after 8-byte discriminator:
  //   admin: 32 bytes (Pubkey)
  //   protocol_wallet: 32 bytes (Pubkey)
  //   agent_balance_fee: 8 bytes (u64)
  //   creator_fee: 8 bytes (u64)
  //   protocol_fee: 8 bytes (u64)
  //   enclave_pubkey: 1 byte (Option tag) + 32 bytes ([u8; 32])
  const data = accountInfo.data
  const enclaveOptionOffset = 8 + 32 + 32 + 8 + 8 + 8 // = 96
  const hasEnclave = data[enclaveOptionOffset] === 1
  if (!hasEnclave) throw new Error('Enclave public key not set in Solana protocol config')

  return Uint8Array.from(data.subarray(enclaveOptionOffset + 1, enclaveOptionOffset + 1 + 32))
}

// Build the register_agent message that was signed by the enclave
// Must match: signature.rs build_register_agent_message
export function buildRegisterAgentMessage(params: {
  intent: number
  timestamp: bigint // seconds
  agentId: string
  costPerMessage: bigint
  promptHash: Uint8Array // 32 bytes
  creator: PublicKey
}): Uint8Array {
  const intentBuf = Buffer.from([params.intent])
  const timestampBuf = Buffer.alloc(8)
  timestampBuf.writeBigInt64LE(params.timestamp, 0)
  const agentIdBuf = Buffer.from(params.agentId)
  const costBuf = Buffer.alloc(8)
  costBuf.writeBigUInt64LE(params.costPerMessage, 0)
  const promptHashBuf = Buffer.from(params.promptHash)
  const creatorBuf = params.creator.toBuffer()

  return Buffer.concat([intentBuf, timestampBuf, agentIdBuf, costBuf, promptHashBuf, creatorBuf])
}
