# Red Sentinel

Red Sentinel is an on-chain AI arena where defenders deploy Sentinels and attackers try to breach them with prompt-injection and jailbreak attempts. A Sentinel can combine public and private instructions, a defined attack objective, a selected language-model provider, a bounty pool, and an attack fee. Defenders can attach retrieval content and enable approved API tooling where the Sentinel type permits it. A verified breach releases the bounty pool on-chain. Failed attacks keep the arena active: 50 percent of the attack fee increases the bounty pool, 40 percent goes to the defender or its syndicate, and 10 percent goes to the Red Sentinel protocol. Red Sentinel is live across multiple supported networks (shown dynamically in the app).

Red Sentinel has two complementary entry points. Security Sentinels give AI builders a public, economically backed way to test meaningful agent boundaries. Campaign Sentinels give ecosystem partners a brand-safe way to introduce their communities to the arena. A Campaign Sentinel uses only partner-approved public information and a harmless hidden challenge phrase. Attackers attempt to make the Sentinel reveal that exact phrase. A verified reveal is a binary, on-chain challenge result and can pay the campaign bounty instantly. The outcome is safe to share and does not expose private data, production credentials, or live tool actions.

For attackers, Red Sentinel is a place to earn rewards and build public proof of red-team skill. For defenders, it is a way to set an attack objective, receive continuous adversarial participation, and earn from failed attacks. For syndicates, it is a way to pool capital behind a Sentinel and share eligible defender-side attack-fee proceeds in proportion to contributions. For partner projects, Campaign Sentinels create a sponsored community challenge that combines project education, social distribution, and a clear path into deeper AI-agent security testing.
The product narrative is simple: build an AI defense, put value behind it, and let the internet test it. Campaign Sentinels are the safe first experience. Security Sentinels extend that loop to real agent assurance.



# HackMeridian

## Stellar Integration

For HackMeridian, Red Sentinel is live on Stellar. We ported the full
crowdsourced AI red-teaming protocol to Soroban as a single
contract. the same attack → TEE verdict → settlement loop, now settling in
XLM and any SEP-41 token.

**Contracts:** https://github.com/red-sentinel-ai/steller-contracts

- **One contract, no vault accounts.** The contract custodies funds itself:
  per-agent reward pools and creator fees live in persistent storage, and the
  fee split (agent pool / creator / protocol: 50% / 40% / 10%) settles
  atomically per attack.
- **On-chain TEE verdict verification.** The enclave signs its verdict with
  Ed25519 and Soroban verifies it natively (`env.crypto().ed25519_verify`),
  no pre-instruction dance like Solana. Signatures expire in 180 seconds and
  future-dated ones are rejected.
- **Dynamic pricing.** Each attack raises the agent's `cost_per_message` by
  100 bps (capped at 3x), so breaking an agent gets progressively more
  expensive and the reward pool the attacker drains grows with every attempt.

- **Battle-tested.** 32 integration tests plus a full end-to-end flow executed
  on-chain: register → fund → attack (fee split verified) → enclave-signed
  success verdict → attacker drains the pool → agent defeated → creator claims
  fees.

**Live on Stellar testnet:**

| | |
| --- | --- |
| Contract ID | `CBJ6XDS76GYHL6KJCE2W5V7Z4ZFW2TSPL5BE7WDNKMQ4VDVLLBJIOMFM` |
| Protocol wallet | `GBXQBNPJ7QU7APUK2GYAEDO7I4AA4XLN4IS6AU4WMSFPMSTKYC6UUVG4` |
