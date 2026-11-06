import { APP_NETWORK } from '@/constants'
import { retryingFetch } from './rpc-client'

// The official GraphQL service is the only Sui endpoint that still works from
// the browser: every public JSON-RPC gateway returns "JSON-RPC has been
// deprecated" (see constants/sui-rpc), and the gRPC endpoints send no CORS
// headers, so grpc-web is blocked in browsers. GraphQL is Sui's recommended
// frontend API and serves `access-control-allow-origin: *`.
const SUI_GRAPHQL_URLS = {
  mainnet: 'https://graphql.mainnet.sui.io/graphql',
  testnet: 'https://graphql.testnet.sui.io/graphql',
} as const

const BALANCE_QUERY = /* GraphQL */ `
  query Balance($owner: SuiAddress!, $coinType: String!) {
    address(address: $owner) {
      balance(coinType: $coinType) {
        totalBalance
      }
    }
  }
`

interface BalanceResponse {
  data?: {
    address?: {
      balance?: {
        totalBalance: string
      } | null
    } | null
  } | null
  errors?: { message: string }[]
}

/**
 * Fetch a coin balance via the official Sui GraphQL endpoint and return the
 * raw base-unit amount as a string, mirroring `client.getBalance(...).totalBalance`.
 * A held-nothing coin returns "0"; a malformed coin type throws (the old
 * JSON-RPC client threw too, and callers already catch).
 */
export async function fetchSuiBalance(owner: string, coinType: string): Promise<string> {
  const response = await retryingFetch(SUI_GRAPHQL_URLS[APP_NETWORK], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: BALANCE_QUERY,
      variables: { owner, coinType },
    }),
  })

  if (!response.ok) {
    throw new Error(`Sui GraphQL request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as BalanceResponse

  if (payload.errors?.length) {
    throw new Error(`Sui GraphQL error: ${payload.errors[0].message}`)
  }

  return payload.data?.address?.balance?.totalBalance ?? '0'
}
