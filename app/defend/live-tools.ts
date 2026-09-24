import type { LiveToolMeta, LiveToolProviderGroup } from './agentic-types'

export const LIVE_TOOLS: LiveToolMeta[] = [
  {
    tool_id: 'botchain.get_stats',
    provider: 'BotChain',
    name: 'BotChain Network Stats',
    description:
      'Fetch live BotChain network statistics — BOT price, gas prices, market cap, TVL, and transaction counts.',
  },
  {
    tool_id: 'walrus.get_market_info',
    provider: 'Walrus',
    name: 'Walrus Market Info',
    description:
      'Fetch the live WAL token price and Walrus network-wide market and storage metrics from Walruscan.',
  },
  {
    tool_id: 'walrus.get_blob_info',
    provider: 'Walrus',
    name: 'Walrus Blob Lookup',
    description:
      'Look up a Walrus blob by its blob ID and return the metadata Walruscan holds for it.',
  },
  {
    tool_id: 'walrus.get_account_info',
    provider: 'Walrus',
    name: 'Walrus Account Lookup',
    description:
      'Look up a Walrus account by Sui address — WAL balance, total blobs, and total events.',
  },
  {
    tool_id: 'walrus.estimate_storage_cost',
    provider: 'Walrus',
    name: 'Walrus Storage Cost Calculator',
    description:
      'Estimate what it costs to store files on Walrus — blobs, encoded volume, WAL/SUI totals, and cost per GB. Uses the official calculator model with live prices.',
  },
  {
    tool_id: 'monad.get_market_info',
    provider: 'Monad',
    name: 'Monad Market Info',
    description:
      'Fetch the live MON token price, market cap, circulating supply, and all-time high/low from CoinGecko.',
  },
  {
    tool_id: 'monad.get_network_stats',
    provider: 'Monad',
    name: 'Monad Network Stats',
    description:
      'Fetch live Monad mainnet statistics — latest block, gas price and base fee, block utilization, and the MON price.',
  },
  {
    tool_id: 'monad.get_account_info',
    provider: 'Monad',
    name: 'Monad Account Lookup',
    description:
      'Look up any Monad address — MON balance and its USD value, transactions sent, and whether it is a wallet or a contract.',
  },
  {
    tool_id: 'monad.get_transaction_info',
    provider: 'Monad',
    name: 'Monad Transaction Lookup',
    description:
      'Look up a Monad transaction by hash — success or revert, block, value moved, gas used, and the fee paid in MON and USD.',
  },
  {
    tool_id: 'monad.estimate_transaction_cost',
    provider: 'Monad',
    name: 'Monad Gas Cost Calculator',
    description:
      'Estimate what transactions cost on Monad — fee per transaction and batch totals in MON and USD, at live or hypothetical gas prices.',
  },
]

/** Providers and their tools keep the declaration order above. */
export const LIVE_TOOLS_BY_PROVIDER: LiveToolProviderGroup[] =
  LIVE_TOOLS.reduce<LiveToolProviderGroup[]>((groups, tool) => {
    const group = groups.find(candidate => candidate.provider === tool.provider)
    if (group) {
      group.tools.push(tool)
    } else {
      groups.push({ provider: tool.provider, tools: [tool] })
    }
    return groups
  }, [])
