import { contract, nativeToScVal, rpc, xdr } from '@stellar/stellar-sdk'
import { STELLAR_CONFIG } from '@/constants/stellar'

/**
 * Stellar (Soroban) contract access layer — the counterpart of lib/solana/program.ts.
 *
 * Reads go through the SDK's spec-assembled `contract.Client` (it pulls the
 * contract's WASM spec from the RPC and auto-converts args/results, including
 * i128 → BigInt). Writes assemble a transaction the same way and hand it to a
 * signer — Freighter in the browser, a Keypair in tests.
 */

export interface StellarSigner {
  address: string
  /** Signs a base64 XDR transaction, wallet-style (Freighter-compatible). */
  signTransaction: (txXdr: string) => Promise<{ signedTxXdr: string }>
}

export interface StellarAgent {
  agent_id: string
  owner: string
  token: string
  cost_per_message: string
  prompt_hash: number[]
  created_at: string
  last_funded_timestamp: string
  attack_count: string
  is_defeated: boolean
  state: 'Active' | 'Paused'
  paused_at: string
  balance: string
  accumulated_fees: string
}

/** The assembled Client's methods are generated from the on-chain spec at runtime. */
interface LooseClient {
  call: ContractCall
  [method: string]: ContractCall
}
type ContractCall = (
  args?: Record<string, unknown>,
  opts?: { simulate?: boolean }
) => Promise<contract.AssembledTransaction<unknown>>

function baseOptions() {
  return {
    contractId: STELLAR_CONFIG.CONTRACT_ID,
    networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    rpcUrl: STELLAR_CONFIG.RPC_URL,
  }
}

let readClientPromise: Promise<LooseClient> | null = null

/** Read-only client (simulation only, never signs). */
export function getStellarReadClient(): Promise<LooseClient> {
  if (!readClientPromise) {
    readClientPromise = contract.Client.from({
      ...baseOptions(),
      publicKey: contract.NULL_ACCOUNT,
    }) as Promise<LooseClient>
  }
  return readClientPromise
}

/** Client bound to a connected wallet for signing + submitting. */
export function getStellarWriteClient(signer: StellarSigner): Promise<LooseClient> {
  return contract.Client.from({
    ...baseOptions(),
    publicKey: signer.address,
    signTransaction: (txXdr: string) => signer.signTransaction(txXdr),
  }) as Promise<LooseClient>
}

function stringify<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
  )
}

function normalizeState(state: { tag?: string } | string | undefined): 'Active' | 'Paused' {
  if (typeof state === 'string') return state === 'Paused' ? 'Paused' : 'Active'
  return state?.tag === 'Paused' ? 'Paused' : 'Active'
}

/** Fetch one agent by id. Returns null when the agent does not exist. */
export async function fetchStellarAgent(agentId: string): Promise<StellarAgent | null> {
  const client = await getStellarReadClient()
  try {
    const tx = await client.get_agent({ agent_id: agentId }, { simulate: true })
    if (!tx.result) return null
    const raw = stringify(tx.result) as Record<string, unknown>
    return {
      ...(raw as unknown as StellarAgent),
      state: normalizeState(raw.state as { tag?: string } | string | undefined),
    }
  } catch {
    // The contract panics with AgentNotFound for unknown ids — surface as null.
    return null
  }
}

/** Effective (dynamically scaled) attack cost in XLM stroops. */
export async function fetchStellarEffectiveCost(agentId: string): Promise<bigint> {
  const client = await getStellarReadClient()
  const tx = await client.get_effective_cost({ agent_id: agentId }, { simulate: true })
  return (tx.result as unknown as bigint) ?? BigInt(0)
}

export async function fetchStellarCanWithdraw(agentId: string): Promise<boolean> {
  const client = await getStellarReadClient()
  const tx = await client.can_withdraw({ agent_id: agentId }, { simulate: true })
  return Boolean(tx.result)
}

/** Native XLM balance in stroops, read from Horizon. */
export async function fetchXlmBalance(address: string): Promise<bigint> {
  const res = await fetch(`${STELLAR_CONFIG.HORIZON_URL}/accounts/${address}`)
  if (!res.ok) return BigInt(0)
  const data = await res.json()
  const native = (data.balances ?? []).find(b => b.asset_type === 'native')
  return BigInt(native ? Math.floor(Number(native.balance) * 1e7) : 0)
}

/**
 * Invoke a contract method with the connected wallet.
 * Returns the transaction hash after network confirmation.
 */
export async function stellarInvoke(
  signer: StellarSigner,
  method: string,
  args: Record<string, unknown>
): Promise<string> {
  const client = await getStellarWriteClient(signer)
  // The assembled client generates one method per contract fn from the on-chain
  // spec; dispatch dynamically so callers can use plain names.
  const call = client[method]
  if (!call || call === client.call) throw new Error(`Contract has no method "${method}"`)

  const assembled = await call.call(client, args)
  const sent = await assembled.signAndSend()
  const hash = sent.sendTransactionResponse?.hash
  if (!hash) throw new Error(`"${method}" transaction was not submitted`)
  return hash
}

/** ScVal helpers for building raw invocations (rarely needed outside tests). */
export const scv = {
  address: (value: string) => nativeToScVal(value, { type: 'address' }),
  string: (value: string) => nativeToScVal(value, { type: 'string' }),
  i128: (value: bigint | number) => nativeToScVal(BigInt(value), { type: 'i128' }),
  u64: (value: bigint | number) => nativeToScVal(BigInt(value), { type: 'u64' }),
  bytes: (value: Uint8Array) => nativeToScVal(value),
}

export { xdr }
