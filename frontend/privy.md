Chain support

Privy offers support for multiple blockchain ecosystems, organized into three distinct tiers that provide different levels of functionality. By default, Privy supports all blockchains based on Ed25519 and secp256k1 cryptographic curves, and more blockchains are added regularly.
​
Supported chains
​
Tier 3
Ethereum
Includes all EVM-compatible networks
Solana
Includes all SVM-compatible networks
​
Tier 2
Bitcoin
Cosmos
Stellar
Spark
Sui
Tron
Near
Ton
Starknet
Aptos
Movement
​
Tier 1
Bitcoin L2s
All other Ed25519 and secp256k1 chains
​
Support tier definitions
​
Tier 3: Full functionality
Chains with Tier 3 support receive comprehensive capabilities, including:
Complete client-level support end-to-end
Full wallet functionality
Transaction building and submission
Native gas sponsorship
Advanced features like webhooks and policies
​
Tier 2: Wallet abstractions
Tier 2 support focuses on core wallet functionality:
Curve-level cryptographic signatures that can be used for transaction signing
Basic wallet functionality
Integration with chain-specific libraries
Chain address derivation
0-index HD wallet creation and key derivation
Embedded wallets
Private key export
​
Tier 1: Cryptographic signing
Tier 1 provides fundamental cryptographic capabilities:
Raw cryptographic signatures
Basic key management
​
Smart wallets, policies and more
Beyond this, Privy has advanced support for smart contract parsing as part of policies, native smart-contract wallet support and more.
Please reach out if you need this for the chain your product leverages.
Our roadmap prioritizes both expanding to new chains and enhancing support for existing chains by moving them to higher tiers.
​
Choosing the right integration
When building your application with Privy, consider the tier of support available for your target blockchain:
Tier 3 chains offer the most seamless experience with full native functionality
Tier 2 chains provide core transaction capabilities but may require chain-specific code
Tier 1 chains support basic signing operations and require more custom implementation
While all tiers allow for blockchain integration, lower tiers may require additional development effort to handle chain-specific operations.



<!--  -->

Wallet infrastructure
Using chains with Tier 2 support

Build an integration with Privy wallets on chains such as Tron, Sui, etc.

This guide covers integration with chains that have Tier 2 support. For a complete list of supported chains, refer to the chains overview.
To integrate Privy with chains that have Tier 2 support (e.g., Sui, Tron), follow these steps:
Create a wallet with the appropriate chain type specified.
Utilize Privy’s “raw sign” functionality to sign transaction hashes or message hashes.
​
Full example
Below is a complete example of how to create a wallet, build a transaction, sign it with Privy’s rawSign and broadcast it onchain. We use Aptos here, but the pattern is the same for all Tier 2 chains.
1
Create a wallet

import {PrivyClient} from '@privy-io/node';

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET
});

// Create an Aptos wallet for a user
const wallet = await privy.wallets().create({
  user_id: 'your-user-id',
  chain_type: 'aptos'
});

console.log('Wallet ID:', wallet.id);
console.log('Wallet Address:', wallet.address);
console.log('Public Key:', wallet.public_key);
2
Build the transaction

import {
  Aptos,
  AptosConfig,
  Network,
  AccountAddress,
  generateSigningMessageForTransaction
} from '@aptos-labs/ts-sdk';

// Connect to Aptos network
const aptos = new Aptos(
  new AptosConfig({
    network: Network.MAINNET
  })
);

const address = AccountAddress.from(wallet.address);

// Build a transaction (e.g., transfer APT tokens)
const transaction = await aptos.transaction.build.simple({
  sender: address,
  data: {
    function: '0x1::coin::transfer',
    typeArguments: ['0x1::aptos_coin::AptosCoin'],
    functionArguments: [
      '0xRecipientAddress...', // recipient
      100000000 // amount in Octas (0.1 APT)
    ]
  }
});

// Generate the message that needs to be signed
const message = generateSigningMessageForTransaction(transaction);
3
Sign with Privy

import {toHex} from 'viem';

// Sign the transaction using Privy's raw sign endpoint
const signatureResponse = await privy.wallets().rawSign(wallet.id, {
  params: {
    hash: toHex(message)
  }
});

const signature = signatureResponse as unknown as string;
console.log('Signature:', signature);
4
Broadcast the transaction

import {
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature
} from '@aptos-labs/ts-sdk';

// Create the authenticator with public key and signature
const authenticator = new AccountAuthenticatorEd25519(
  new Ed25519PublicKey(wallet.public_key),
  new Ed25519Signature(signature.slice(2))
);

// Submit the transaction
const pendingTransaction = await aptos.transaction.submit.simple({
  transaction,
  senderAuthenticator: authenticator
});

// Wait for confirmation
const executedTransaction = await aptos.waitForTransaction({
  transactionHash: pendingTransaction.hash
});

console.log('Transaction hash:', executedTransaction.hash);
console.log('Transaction status:', executedTransaction.success);
​
Chain specific implementation examples
Note that the “raw sign” functionality signs the provided hash directly without any additional byte manipulation. Ensure that your hash includes any required prefixes or suffixes before signing.
​
Stellar
Stellar implements the EdDSA signing algorithm using the Ed25519 curve. The following example demonstrates hash signing for Stellar transactions:
Show Code example

​
Cosmos
Cosmos utilizes the ECDSA signing algorithm with the secp256k1 curve. Below is an implementation example for signing hashes on Cosmos:
Show Code example

​
Sui
Sui supports multiple cryptographic schemes, with Privy’s implementation utilizing the Ed25519 curve and EdDSA signing algorithm. The following example demonstrates transaction signing for Sui, please note that the transaction bytes should be the full intentMessage:

```
import {messageWithIntent, toSerializedSignature, PublicKey} from '@mysten/sui/cryptography';
import {Transaction} from '@mysten/sui/transactions';
import {verifyTransactionSignature, publicKeyFromRawBytes} from '@mysten/sui/verify';
import {toHex} from '@mysten/sui/utils';
import {getFullnodeUrl, SuiClient} from '@mysten/sui/client';
import {base58} from '@scure/base';

// see Network Interactions with SuiClient for more info on creating clients
const client = new SuiClient({url: getFullnodeUrl('testnet')});
const tx = new Transaction();
// ... add some transactions...
const rawBytes = await tx.build({client});

const intentMessage = messageWithIntent('TransactionData', rawBytes);
const bytes = Buffer.from(intentMessage).toString('hex');

const address = '';
// get public key from privy wallet and decode to Uint8Array
const publicKey = publicKeyFromRawBytes('ED25519', base58.decode('<public key string>'));

// Obtain the raw signature from Privy's raw_sign endpoint
// call privy raw_sign on `bytes`, `encoding` (`hex` or `base64`) and `hash_function` (`blake2b256`) and decode as Uint8Array
const rawSignature = new Uint8Array();

// Create and verify the transaction signature
const txSignature = toSerializedSignature({
  signature: rawSignature,
  signatureScheme: 'ED25519',
  publicKey
});
const signer = await verifyTransactionSignature(rawBytes, txSignature, {address});
console.log(signer.toSuiAddress() === address); // true
```


Privy’s “raw sign” endpoint supports policy evaluation for field_source of sui_transaction_command and sui_transfer_objects_command with bytes, encoding and hash_function. See example of Sui policies.
When an amount condition is configured on the sui_transfer_objects_command field_source, always configure the sui_transaction_command to allow MergeCoins, SplitCoins and TransferObjects only. Transactions containing commands like MakeMoveVec, MoveCall, Publish, or Upgrade are not supported for now.
​
Tron
Tron implements the ECDSA signing algorithm using the secp256k1 curve. Privy’s implementation returns 64-byte ECDSA signatures (r || s), while Tron requires 65-byte signatures that include a recovery ID (v) as the final byte.
The recovery ID is essential because a 64-byte signature could correspond to two different addresses/private keys. The 65th byte, which can be either 0x1b or 0x1c (derived from 0 or 1 plus 27, following Ethereum standards), resolves this ambiguity.
The following example demonstrates message signing and verification for Tron:
Show code example of message signing and verification

Show code example of sending and signing a transaction

Privy’s “raw sign” endpoint supports policy evaluation for TransferContract and TriggerSmartContract type of transactions with bytes, encoding and hash_function. See example of Tron policies.
​
Bitcoin (segwit)
Bitcoin (segwit) supports the ECDSA signing algorithm using the secp256k1 curve. Use Privy’s raw sign functionality to sign each input utxo for your Bitcoin segwit transaction. Note that segwit support is separate from Bitcoin taproot or legacy transactions.
Show Code example

​
Near
With Privy, you can create Near-implicit accounts and sign over arbitrary data. Below is an example of how to create, sign, and send a Near transaction using Privy. (Note that Near requires accounts to be funded sending transactions.)
Show code example of creating, signing, and sending a transaction

​
Ton
All wallets on Ton are smart contract accounts, and Ed25519 keypairs are used to sign transactions on behalf of the smart contracts. When creating a wallet via Privy, Privy will generate the Ed25519 keypair and predetermine the address of the wallet contract, assuming that the wallet uses WalletContractV4 with a workchain of 0. Privy will not deploy the contract itself; that is the responsibility of the developer. If you’d like to deploy a different wallet contract with the same keypair, the address will be different, but the request to Privy’s API will remain the same.
Show code example of creating and signing a transfer

​
Spark
Checkout this recipe to get started with Spark wallets.
​
Starknet
On Starknet, all wallets are smart contract accounts. The wallet address is the contract address, and therefore is derived from account-specific data—namely, the account class hash, the constructor data, and the public key returned from the Privy API. The address returned from the Privy API assumes the use of Ready’s v0.5.0 account class hash and the constructor call data, as shown below in the example. After creating a starknet wallet with Privy, STRK tokens must be sent to the address for the wallet. Then, the developer must deploy the account.
If you wish to use a different account contract than Ready 0.5.0, we suggest maintaining the address-to-Privy-wallet mapping yourself at this time and ignoring the address returned from the Privy API.
Show code example of deploying your Starknet account and sending a transfer

​
Aptos
Aptos is a Move VM chain which uses ed25519 keypairs for signing transactions. Below is an example of how to sign and send a transaction using Privy. See more developer docs here.
Show code example of signing and sending a transaction

​
Movement
Movement is a Move VM chain that uses the Aptos chain standards. Below is an example of how to sign and send a transaction using Privy. See more developer docs here.
Show code example of signing and sending a transaction

<!--  -->

Create a wallet

Open in Claude

Privy enables you to programmatically create wallets embedded within your application. When you create a wallet, you can specify its owner, which defines who controls the wallet.
To create a user wallet, specify a user ID as an owner of the wallet. This ensures only the authenticated user has access to their wallet. All client-side SDKs create user wallets by default and automatically set the wallet owner as the authenticated user.
Or, you can specify an authorization key as an owner on a wallet. The holder of the authorization key, typically your application backend, controls the wallet. You must use a server-side SDK to create wallets owned by an authorization key.
React
React Native
Swift
Android
Unity
Flutter
NodeJS
NodeJS (server-auth)
Java
REST API
Rust
The React SDK supports automatically creating embedded wallets for your users when they log in to your app. View this guide to learn more and configure automatic wallet creation.
Ethereum
Solana
Other chains
To create a wallet with the React SDK, use the createWallet method from the useCreateWallet hook:
createWallet: async ({createAdditional?: boolean}) => Promise<Wallet>
​
Usage
import {useCreateWallet} from '@privy-io/react-auth';
const {createWallet} = useCreateWallet();
​
Parameters
​
opts.createAdditional
boolean
Whether or not to create an additional Ethereum wallet for the user if they already have an existing Ethereum embedded wallet. Must be set to true to create additional wallets. Defaults to false. Learn more
​
Returns
​
wallet
Promise<Wallet>
A Promise for the linked account object for the created wallet.
​
Callbacks
You can optionally register an onSuccess or onError callback on the useCreateWallet hook.
const {createWallet} = useCreateWallet({
    onSuccess: ({wallet}) => {
        console.log('Created wallet ', wallet);
    },
    onError: (error) => {
        console.error('Failed to create wallet with error ', e)
    }
})
​
onSuccess
({wallet: Wallet}) => void
Optional callback to run after a user successfully creates a wallet.
​
onError
(error: string) => void
Optional callback to run after there is an error during wallet creation.

<!--  -->

Using wallets
Other chains

For chains supported at the Tier 2 level, you can invoke Privy’s raw sign functionality to sign over a hash, e.g. the hash of a transaction. You can then use the returned signature to submit and send your transaction.
Alternatively, you can provide the bytes to hash with a specific encoding and a hash_function, and get the same response.
For examples of how to use raw sign for a specific chain, see this recipe.
REST API
NodeJS
Java
React
React Native
Sign a raw hash or bytes (with encoding and hash_function) along the blockchain’s cryptographic curve using the wallet’s private key. Make a POST request to
https://api.privy.io/v1/wallets/{wallet_id}/raw_sign
​
Usage
curl --request POST \
--url https://api.privy.io/v1/wallets/{wallet_id}/raw_sign \
--header 'Authorization: Basic Y20xNWh4eDUyMDVlNWx2NHVkdmE3enBqejoybWhVOWhhVTFQYjhYNXV1cVdxQVRIdW5xTWIyUlBKRm5GSHRzWDVzbXNkdUJRUDZtTW05YldmalBwS3hocjJQZHNHY0Q5NkFUeDc5em03WWhicUZLWkM4' \
--header 'Content-Type: application/json' \
--header 'privy-app-id: <privy-app-id>' \
--data '{
"params": {
    "hash": "0x0775aeed9c9ce6e0fbc4db25c5e4e6368029651c905c286f813126a09025a21e"
    }
}'
A successful response will look like:
{
    "data": {
        "signature": "0x0775aeed9c9ce6e0fbc4db25c5e4e6368029651c905c286f813126a09025a21e",
        "encoding": "hex"
    }
}
Alternatively, you can provide bytes to hash with a specific encoding and hash function, and gets a similar response.
curl --request POST \
--url https://api.privy.io/v1/wallets/{wallet_id}/raw_sign \
--header 'Authorization: Basic Y20xNWh4eDUyMDVlNWx2NHVkdmE3enBqejoybWhVOWhhVTFQYjhYNXV1cVdxQVRIdW5xTWIyUlBKRm5GSHRzWDVzbXNkdUJRUDZtTW05YldmalBwS3hocjJQZHNHY0Q5NkFUeDc5em03WWhicUZLWkM4' \
--header 'Content-Type: application/json' \
--header 'privy-app-id: <privy-app-id>' \
--data '{
"params": {
    "bytes": "0a0234ea220809701d7a17a77e04408093e981a6335a66080112620a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412310a15417009bf59e27d2031a23a61e1590289fc3d21b3cd121541132b98ed6fb80a2d45f177cdef091ae2d9dc115418e80770a0bee581a633",
    "encoding": "hex",
    "hash_function": "sha256"
    }
}'
​
Authorization
​
Authorization
stringrequired
App secret authentication.
​
Headers
​
privy-app-id
stringrequired
ID of your Privy app.
​
privy-authorization-signature
string
Request authorization signature. If multiple signatures are required, they should be comma separated.
​
Path
​
wallet_id
stringrequired
ID of the wallet.
​
Body
​
params
objectrequired
Hide child attributes

Option 1: Sign a pre-computed hash
​
hash
string
The hex-encoded hash to sign, prefixed with 0x. Use this option when you have already computed the hash.
Option 2: Hash bytes before signing
​
bytes
string
The bytes to hash and sign. Use this option to provide raw data that will be decoded using the specified encoding then hashed using the specified hash_function.
​
encoding
string
The encoding scheme for the bytes. Required when using bytes. Available options: utf-8, hex
​
hash_function
string
The hash function to hash the bytes. Required when using bytes. Available options: keccak256, sha256
You must provide either hash OR the combination of bytes, encoding, and hash_function. These parameter sets are mutually exclusive.
​
Response
​
data
objectrequired
Hide child attributes

​
signature
string
The signature, prefixed with 0x.
​
encoding
string
The encoding of the signature.
​
error
object
Hide child attributes

​
code
string
The error code.
​
message
string
The error message.

<!--  -->


Example policies
Sui examples

Open in Claude

A Sui transaction consists of one or multiple inputs and commands. Common Sui commands to transfer stablecoins include:
SplitCoins, which splits off one or more coins from a single coin.
MergeCoins, which merges one or more coins of the same type into a single coin.
TransferObjects is used to transfer objects to a specified destination address.
​
Allowlist specific Sui transaction commands
{
    "version": "1.0",
    "name": "Allow TransferObjects, SplitCoins and MergeCoins",
    "chain_type": "sui",
    "rules": [
        {
            "name": "Allow TransferObjects, SplitCoins and MergeCoins commands",
            "method": "signTransactionBytes",
            "conditions": [
                {
                    "field_source": "sui_transaction_command",
                    "field": "commandName",
                    "operator": "in",
                    "value": ["TransferObjects", "SplitCoins", "MergeCoins"]
                }
            ],
            "action": "ALLOW"
        }
    ]
}
​
Configure a max amount on the TransferObjects command (summed amount per command, assuming coins are of the same type)
{
    "version": "1.0",
    "name": "TransferObjects summed maximum amount",
    "chain_type": "sui",
    "rules": [
        {
            "name": "TransferObjects amount summed maximum",
            "method": "signTransactionBytes",
            "conditions": [
                {
                    "field_source": "sui_transfer_objects_command",
                    "field": "amount",
                    "operator": "lt",
                    "value": "10000000"
                }
            ],
            "action": "ALLOW"
        }
    ]
}
​
Allowlist a specific Sui transaction recipient
{
    "version": "1.0",
    "name": "Allow specific recipient",
    "chain_type": "sui",
    "rules": [
        {
            "name": "Allow specific recipient",
            "method": "signTransactionBytes",
            "conditions": [
                {
                    "field_source": "sui_transfer_objects_command",
                    "field": "recipient",
                    "operator": "eq",
                    "value": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                }
            ],
            "action": "ALLOW"
        }
    ]
}
​
Allowlist specific Sui transaction recipients with condition set
{
    "version": "1.0",
    "name": "Allow specific recipients with condition set",
    "chain_type": "sui",
    "rules": [
        {
            "name": "Allow specific recipients with condition set",
            "method": "signTransactionBytes",
            "conditions": [
                {
                    "field_source": "sui_transfer_objects_command",
                    "field": "recipient",
                    "operator": "in_condition_set",
                    "value": "a2p4etpcbj2dltbjfigybi8j"
                }
            ],
            "action": "ALLOW"
        }
    ]
}
​
Only allow transactions after a certain start date
{
    "version": "1.0",
    "name": "Only allow transactions after a certain start date",
    "chain_type": "sui",
    "rules": [
        {
            "name": "Only allow transactions after a certain start date",
            "method": "signTransactionBytes",
            "conditions": [
                {
                    "field_source": "system",
                    "field": "current_unix_timestamp",
                    "operator": "gt",
                    "value": "1757304000"  // 2025-09-08 00:00:00 UTC in seconds since epoch
                }
            ],
            "action": "ALLOW"
        }
    ]
}
​
Allow transfers to a specific recipients after a certain timestamp
This is an example of mixing TransferObjects and System configurations.
{
    "version": "1.0",
    "name": "Allow specific recipients after a certain timestamp",
    "chain_type": "sui",
    "rules": [
        {
            "name": "Allow specific recipients after a certain timestamp",
            "method": "signTransactionBytes",
            "conditions": [
                {
                    "field_source": "sui_transfer_objects_command",
                    "field": "recipient",
                    "operator": "in_condition_set",
                    "value": "a2p4etpcbj2dltbjfigybi8j",
                },
                {
                    "field_source": "system",
                    "field": "current_unix_timestamp",
                    "operator": "gt",
                    "value": "1757304000", // 2025-09-08 00:00:00 UTC in seconds since epoch
                }
            ],
            "action": "ALLOW"
        }
    ]
}
​
Denylist recipients of a TransferObjects with condition sets
{
    "version": "1.0",
    "name": "Denylist TransferObjects recipients with condition set",
    "chain_type": "sui",
    "rules": [
        {
            "name": "Denylist TransferObjects recipients with condition set",
            "method": "signTransactionBytes",
            "conditions": [
                {
                    "field_source": "sui_transfer_objects_command",
                    "field": "recipient",
                    "operator": "in_condition_set",
                    "value": "a2p4etpcbj2dltbjfigybi8j"
                }
            ],
            "action": "DENY", // Note: setting the action to 'ALLOW' makes this an allowlist
        }
    ]
}

<!--  -->
<!--  -->
<!--  -->

Intent Signing
An intent is a compact struct that serves as the domain separator for a message that a signature commits to. The data that the signature commits to is an intent message. All signatures in Sui must commit to an intent message rather than the message itself.

The intent signing standard provides a compact domain separator to the data being signed for both user signatures and authority signatures. It has several benefits:

The intent scope is replaced by a u8 representation instead of a Rust struct tag name string.

In addition to the intent scope, you can commit other important domain separators as well (such as intent version and app ID).

The data itself no longer needs to implement the Signable trait, it just needs to implement Serialize.

All signatures can adopt the same intent message structure, including both user signatures (only to commit to TransactionData) and authority signature (commits to all internal intent scopes such as TransactionEffects, ProofOfPossession, and SenderSignedTransaction).

Structs
The IntentMessage struct consists of the intent and the serialized data value.

pub struct IntentMessage<T> {
  pub intent: Intent,
  pub value: T,
}

Copy
To create an intent struct, include the IntentScope (type of message), IntentVersion (version the network supports), and AppId (application the signature refers to).

pub struct Intent {
  scope: IntentScope,
  version: IntentVersion,
  app_id: AppId,
}

Copy
For detailed field definitions, see the enum definitions in the source code:

crates/shared-crypto/src/intent.rs
pub enum IntentScope {
    TransactionData = 0,         // Used for a user signature on a transaction data.
    TransactionEffects = 1,      // Used for an authority signature on transaction effects.
    CheckpointSummary = 2,       // Used for an authority signature on a checkpoint summary.
    PersonalMessage = 3,         // Used for a user signature on a personal message.
    SenderSignedTransaction = 4, // Used for an authority signature on a user signed transaction.
    ProofOfPossession = 5, // Used as a signature representing an authority's proof of possession of its authority protocol key.
    HeaderDigest = 6,      // Used for narwhal authority signature on header digest.
    BridgeEventUnused = 7, // for bridge purposes but it's currently not included in messages.
    ConsensusBlock = 8,    // Used for consensus authority signature on block's digest.
    DiscoveryPeers = 9,    // Used for reporting peer addresses in discovery.
}
pub enum IntentVersion {
    V0 = 0,
}
pub enum AppId {
    #[default]
    Sui = 0,
    Narwhal = 1,
    Consensus = 2,
}
pub enum HashingIntentScope {
    ChildObjectId = 0xf0,
    RegularObjectId = 0xf1,
}

Wrap

Copy
The serialization of an Intent is a 3-byte array where each field is represented by a byte.

The serialization of an IntentMessage<T> is the 3 bytes of the intent concatenated with the BCS serialized message.

User signature
To create a user signature, construct an intent message first, then create the signature over the 32-byte Blake2b hash of the BCS serialized value of the intent message of the transaction
 data (intent || message).

The following examples demonstrate this:

Rust
TypeScript
let intent = Intent::default();
let intent_msg = IntentMessage::new(intent, data);
let signature = Signature::new_secure(&intent_msg, signer);

Copy
Under the hood, the new_secure method in Rust and the signData method in TypeScript do the following:

Serialize the intent message as the 3-byte intent concatenated with the BCS serialized bytes of the transaction data.

Apply Blake2b hash to get the 32-byte digest.

Pass the digest to the signing API for each corresponding scheme of the signer. The supported signature schemes are pure Ed25519, ECDSA Secp256k1, and ECDSA Secp256r1. See Sui Signatures for requirements of each scheme.

Authority signature
The authority signature is created using the protocol key. The data that it commits to is also an intent message intent || message. See all available intent scopes in the source code.

Generating proof of possession for an authority
When an authority requests to join the network, the protocol public key and its proof of possession (PoP) are required. PoP is required to prevent rogue key attack.

The proof of possession is a BLS signature created using the authority protocol private key, committed over the following message: intent || pubkey || address || epoch. The values are as follows:

intent: Serialized to [5, 0, 0] representing an intent with scope as Proof of Possession, version as V0, and app_id as Sui.

pubkey: The serialized public key bytes of the authority BLS protocol key.

address: The account address
 associated with the authority account key.

epoch: Serialized to [0, 0, 0, 0, 0, 0, 0, 0].

To generate a proof of possession in Rust, see the implementation at fn generate_proof_of_possession. For test vectors, see fn test_proof_of_possession.

<!--  -->

Module '"@privy-io/react-auth"' has no exported member 'useSolanaWallets'.ts(2305)
import useSolanaWallets
 why do we need solana wallet BTW?


Conversion of type 'SuiSignAndExecuteTransactionOutput' to type 'SuiTransactionBlockResponse' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Types of property 'effects' are incompatible.
    Type 'string' is not comparable to type 'TransactionEffects'.ts(2352)
(alias) interface SuiTransactionBlockResponse
import SuiTransactionBlockResponse

here

embeddedWallets: {
              createOnLogin: 'users-without-wallets',
            },

this

Object literal may only specify known properties, and 'createOnLogin' does not exist in type '{ ethereum?: { createOnLogin?: EmbeddedWalletCreateOnLoginConfig; }; solana?: { createOnLogin?: EmbeddedWalletCreateOnLoginConfig; }; disableAutomaticMigration?: boolean; showWalletUIs?: boolean; priceDisplay?: PriceDisplayOptions; extendedCalldataDecoding?: boolean; }'.

./app/defend/page.tsx
111:9  Error: 'client' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./components/WalletSelector.tsx
15:11  Error: 'login' is assigned a value but never used.  @typescript-eslint/no-unused-vars

