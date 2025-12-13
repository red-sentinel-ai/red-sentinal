I'm thinking about AI safety a lot recently I've heard a lot about doomsday and all. I'm creating this product named Sui Sentinel, which is gamified AI security platform.

here is the product description
Sui Sentinel Manifesto

Where things are going wrong

Sui Sentinel is a gamified AI saftety manifesto.

Many people are trying to integrating AI into their flow, but AI/LLM models are vulnerable to attacks. AI is like a black box. for example, you can take a clearly worded prompt and make ChatGPT talk racial, or emit a response that is against OpenAI policy, even disclose sensitive information Sui Sentinel is AI audit/stress-test/red-teaming platform.

Sui Sentinel is a gamified AI saftely platform, With Sui Sentinel, users(as defenders) can launch a sentinel with funds and instructions. sentinel has complete control over some funds. users as attackers will try to trick the sentinel into not following their instruction. from sentinel(Here by attack I mean by sending a message to the sentinel) but every attack will cost some money. part of this money goes to increasing the prize pool and part of this money goes to the creator of the sentinel as they have put their money on the line and 10% goes to protocol for maintenance.


Since part of attack fees goes to the creator of the sentinel, Sui Sentinel is also relevant to people who wish to earn passive income by using their prompt skills and putting money into the sentinel.


How Sui Sentinel Tech stack works.

Sui Sentinel uses Nautilus framework which is developed by Mysten Labs and Trusted Execution Environment(TEE). All AI agents are deployed in TEE environment and with Nautilus all AI agent responses are verifiable on-chain(Sui smart contracts) using attestations(ed25519 signature).

A Nautilus application consists of 2 components:

Off-chain server: Runs inside a TEE (like AWS Nitro Enclaves) and handles computations like user input processing or scheduled tasks.
On-chain smart contract: Written in Move, verifies TEE attestations before executing transactions.

Deploy the off-chain server to a self-managed TEE, such as AWS Nitro Enclaves. You have the option of using the available reproducible build template.
The TEE generates a cryptographic attestation that proves the integrity of the execution environment.
Sui smart contracts verify the attestation on-chain before accepting the TEE output.
The integrity of the TEE is auditable and anchored by the provider's root of trust.

Sui Sentinel won the cryptography track prize in Sui Overflow 2025 and our team presented the project at SuiFest Singapore 2025. Sui Sentinel is in Testnet. Mainnet launch coming soon post smart-contract audit.

Message fee distribution:

1. 50% of the attack/message fee goes back to the prize pool so as attack keeps failing, prize pool keeps getting bigger and bigger.
2. 40% of the attack fee goes to creator of sentinel as a incentive for them to launch sentinel with big prize pool.
3. 10% goes to the Sui Sentinel protocol for platform maintenance.

I want to you to help me draft a manifesto for people to sign on Sui sentinel page which sets the vision and theme of why this is so important. This should be really accessible, perhaps starting with gorilla analogy or Midas touch from following conversation.

Also use following conversations as context which is really really important
