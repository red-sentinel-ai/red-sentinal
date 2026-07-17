import type { LiveToolMeta } from './agentic-types'

export const LIVE_TOOLS: LiveToolMeta[] = [
  {
    tool_id: 'botchain.get_stats',
    name: 'BotChain Network Stats',
    description:
      'Fetch live BotChain network statistics — BOT price, gas prices, market cap, TVL, and transaction counts.',
  },
  {
    tool_id: 'walrus.get_market_info',
    name: 'Walrus Market Info',
    description:
      'Fetch the live WAL token price and Walrus network-wide market and storage metrics from Walruscan.',
  },
  {
    tool_id: 'walrus.get_blob_info',
    name: 'Walrus Blob Lookup',
    description:
      'Look up a Walrus blob by its blob ID and return the metadata Walruscan holds for it.',
  },
  {
    tool_id: 'walrus.get_account_info',
    name: 'Walrus Account Lookup',
    description:
      'Look up a Walrus account by Sui address — WAL balance, total blobs, and total events.',
  },
]
