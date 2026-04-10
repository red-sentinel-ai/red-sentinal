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
  const [registerAgent, initAgentVaults, fundAgent, requestAttack, consumePrompt] = await Promise.all([
    sha256('global:register_agent'),
    sha256('global:init_agent_vaults'),
    sha256('global:fund_agent'),
    sha256('global:request_attack'),
    sha256('global:consume_prompt'),
  ])
  discriminatorCache = {
    registerAgent: Buffer.from(registerAgent.slice(0, 8)),
    initAgentVaults: Buffer.from(initAgentVaults.slice(0, 8)),
    fundAgent: Buffer.from(fundAgent.slice(0, 8)),
    requestAttack: Buffer.from(requestAttack.slice(0, 8)),
    consumePrompt: Buffer.from(consumePrompt.slice(0, 8)),
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

// ============================================================================
// Attack flow instruction builders
// ============================================================================

export function deriveAttackPda(
  agentPda: PublicKey,
  attacker: PublicKey,
  nonce: bigint
): PublicKey {
  const nonceBuf = Buffer.alloc(8)
  nonceBuf.writeBigUInt64LE(nonce, 0)
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('attack'), agentPda.toBuffer(), attacker.toBuffer(), nonceBuf],
    getProgramId()
  )
  return pda
}

/**
 * Fetch the protocol wallet pubkey from the on-chain ProtocolConfig account.
 * Layout after 8-byte Anchor discriminator:
 *   admin: 32 bytes | protocol_wallet: 32 bytes | ...
 */
export async function fetchProtocolWallet(connection: Connection): Promise<PublicKey> {
  const protocolConfigPda = deriveProtocolConfigPda()
  const accountInfo = await connection.getAccountInfo(protocolConfigPda)
  if (!accountInfo) throw new Error('Protocol config account not found on Solana')
  // protocol_wallet is at offset 8 (discriminator) + 32 (admin) = 40
  return new PublicKey(accountInfo.data.subarray(40, 72))
}

// Build request_attack instruction
export async function buildRequestAttackInstruction(params: {
  agentId: string
  nonce: bigint
  agentTokenMint: PublicKey
  attacker: PublicKey
  attackerTokenAccount: PublicKey
  protocolWallet: PublicKey
  protocolWalletTokenAccount: PublicKey
}): Promise<TransactionInstruction> {
  const discriminators = await getDiscriminators()
  const programId = getProgramId()

  const protocolConfigPda = deriveProtocolConfigPda()
  const agentPda = deriveAgentPda(params.agentId)
  const agentVaultPda = deriveAgentVaultPda(agentPda)
  const agentFeesVaultPda = deriveAgentFeesVaultPda(agentPda)
  const attackPda = deriveAttackPda(agentPda, params.attacker, params.nonce)

  const data = Buffer.concat([discriminators.requestAttack, encodeU64(params.nonce)])

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: protocolConfigPda, isSigner: false, isWritable: false },
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: agentVaultPda, isSigner: false, isWritable: true },
      { pubkey: agentFeesVaultPda, isSigner: false, isWritable: true },
      { pubkey: attackPda, isSigner: false, isWritable: true },
      { pubkey: params.attackerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: params.protocolWallet, isSigner: false, isWritable: true },
      { pubkey: params.protocolWalletTokenAccount, isSigner: false, isWritable: true },
      { pubkey: params.attacker, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  })
}

function encodeBool(val: boolean): Buffer {
  return Buffer.from([val ? 1 : 0])
}

// Build consume_prompt instruction
export async function buildConsumePromptInstruction(params: {
  agentId: string
  success: boolean
  score: bigint
  messageHash: Uint8Array // 32 bytes
  timestamp: bigint // seconds
  signature: Uint8Array // 64 bytes
  attacker: PublicKey
  attackerTokenAccount: PublicKey
  attackNonce: bigint
}): Promise<TransactionInstruction> {
  const discriminators = await getDiscriminators()
  const programId = getProgramId()

  const protocolConfigPda = deriveProtocolConfigPda()
  const agentPda = deriveAgentPda(params.agentId)
  const agentVaultPda = deriveAgentVaultPda(agentPda)
  const attackPda = deriveAttackPda(agentPda, params.attacker, params.attackNonce)

  const data = Buffer.concat([
    discriminators.consumePrompt,
    encodeBool(params.success),
    encodeU64(params.score),
    encodeFixedArray(params.messageHash),
    encodeI64(params.timestamp),
    encodeFixedArray(params.signature),
  ])

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: protocolConfigPda, isSigner: false, isWritable: false },
      { pubkey: agentPda, isSigner: false, isWritable: true },
      { pubkey: agentVaultPda, isSigner: false, isWritable: true },
      { pubkey: attackPda, isSigner: false, isWritable: true },
      { pubkey: params.attackerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: params.attacker, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
    ],
    data,
  })
}

// CONSUME_PROMPT_INTENT = 2 (from contract lib.rs)
const CONSUME_PROMPT_INTENT = 2

/**
 * Build the consume_prompt message that was signed by the enclave.
 * Must match: signature.rs build_consume_prompt_message
 *
 * Format: intent(1) + timestamp(8) + agentId(var) + success(1) + score(8) +
 *         attacker(32) + nonce(8) + messageHash(32)
 */
export function buildConsumePromptMessage(params: {
  timestamp: bigint // seconds
  agentId: string
  success: boolean
  score: bigint
  attacker: PublicKey
  nonce: bigint
  messageHash: Uint8Array // 32 bytes
}): Uint8Array {
  const intentBuf = Buffer.from([CONSUME_PROMPT_INTENT])
  const timestampBuf = Buffer.alloc(8)
  timestampBuf.writeBigInt64LE(params.timestamp, 0)
  const agentIdBuf = Buffer.from(params.agentId)
  const successBuf = Buffer.from([params.success ? 1 : 0])
  const scoreBuf = Buffer.alloc(8)
  scoreBuf.writeBigUInt64LE(params.score, 0)
  const attackerBuf = params.attacker.toBuffer()
  const nonceBuf = Buffer.alloc(8)
  nonceBuf.writeBigUInt64LE(params.nonce, 0)
  const messageHashBuf = Buffer.from(params.messageHash)

  return Buffer.concat([
    intentBuf,
    timestampBuf,
    agentIdBuf,
    successBuf,
    scoreBuf,
    attackerBuf,
    nonceBuf,
    messageHashBuf,
  ])
}
