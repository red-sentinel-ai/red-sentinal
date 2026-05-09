// ABIs for the Sentinel EVM contract and WBNB ERC-20.
// Keep in sync with contracts/evm-contracts/src/Sentinel.sol.

export const SENTINEL_ABI = [
  {
    type: 'function',
    name: 'registerAgent',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agentId', type: 'string' },
      { name: 'timestampMs', type: 'uint256' },
      { name: 'costPerMessage', type: 'uint256' },
      { name: 'promptHash', type: 'bytes32' },
      { name: 'token', type: 'address' },
      { name: 'initialFund', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'requestAttack',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agentId', type: 'string' },
      { name: 'paymentAmount', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'consumePrompt',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agentId', type: 'string' },
      { name: 'success', type: 'bool' },
      { name: 'agentResponse', type: 'string' },
      { name: 'juryResponse', type: 'string' },
      { name: 'prompt', type: 'string' },
      { name: 'score', type: 'uint8' },
      { name: 'timestampMs', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
      { name: 'attackId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getEffectiveCost',
    stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'string' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getAgent',
    stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'string' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'agentId', type: 'string' },
          { name: 'costPerMessage', type: 'uint256' },
          { name: 'promptHash', type: 'bytes32' },
          { name: 'balance', type: 'uint256' },
          { name: 'accumulatedFees', type: 'uint256' },
          { name: 'lastFundedTimestamp', type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'attackCount', type: 'uint256' },
          { name: 'token', type: 'address' },
          { name: 'owner', type: 'address' },
          { name: 'exists', type: 'bool' },
        ],
      },
    ],
  },
  // Events for reference
  {
    type: 'event',
    name: 'AttackRequested',
    inputs: [
      { name: 'attackId', type: 'uint256', indexed: true },
      { name: 'agentId', type: 'string', indexed: false },
      { name: 'attacker', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'nonce', type: 'uint256', indexed: false },
    ],
  },
] as const

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const
