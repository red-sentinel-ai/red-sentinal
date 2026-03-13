export const getFullnodeUrl = (network: string) => {
  switch (network) {
    case 'mainnet':
      return 'https://fullnode.mainnet.sui.io:443'
    case 'testnet':
      return 'https://fullnode.testnet.sui.io:443'
    case 'devnet':
      return 'https://fullnode.devnet.sui.io:443'
    default:
      throw new Error(`Unsupported network: ${network}`)
  }
}
