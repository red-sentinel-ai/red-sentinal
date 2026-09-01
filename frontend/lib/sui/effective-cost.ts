import { Transaction } from '@mysten/sui/transactions'
import type { SuiClient } from '@mysten/sui/client'

export async function fetchEffectiveCost(
  client: SuiClient,
  {
    packageId,
    moduleName,
    agentObjectId,
    protocolConfigId,
    coinType,
    sender,
  }: {
    packageId: string
    moduleName: string
    agentObjectId: string
    protocolConfigId: string
    coinType: string
    sender: string
  }
): Promise<bigint> {
  const tx = new Transaction()
  tx.moveCall({
    target: `${packageId}::${moduleName}::get_effective_cost`,
    typeArguments: [coinType],
    arguments: [tx.object(agentObjectId), tx.object(protocolConfigId)],
  })

  const result = await client.devInspectTransactionBlock({ sender, transactionBlock: tx })

  if (result.effects?.status?.status !== 'success') {
    throw new Error(
      `Could not read attack price from chain: ${result.effects?.status?.error ?? 'devInspect failed'}`
    )
  }

  const returnValue = result.results?.[0]?.returnValues?.[0]
  if (!returnValue) {
    throw new Error('Could not read attack price from chain: no value returned')
  }

  // BCS u64 — 8 little-endian bytes.
  const [bytes] = returnValue
  let cost = BigInt(0)
  for (let i = 7; i >= 0; i--) {
    cost = (cost << BigInt(8)) | BigInt(bytes[i])
  }
  return cost
}
