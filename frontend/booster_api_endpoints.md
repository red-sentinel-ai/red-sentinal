#### Modified: `GET /claim-tokens/:network/:recipient`

**Before:** Directly transferred 100-1000 random SENTINEL tokens
**Now:** Awards a booster coupon based on attack score

- Score 0-69: 5x RARE booster
- Score 70-89: 7x RARE booster
- Score 90-99: 10x EPIC booster
- Score 100: 15x EPIC booster + SUI pool

**Response:**

```json
{
  "claimed": true,
  "boosterAwarded": {
    "tier": "EPIC",
    "multiplier": 10,
    "expiresAt": "2026-03-17T...",
    "boosterId": "65f..."
  },
  "sentinelOwnerReward": 250,
  "message": "Booster coupon awarded! Redeem it via the slot machine..."
}
```

## New API Endpoints

### 1. Spin Slot Machine

```
POST /boosters/:network/spin
```

**Request:**

```json
{
  "walletAddress": "0x123...",
  "boosterId": "65f...",
  "shareToTwitter": false
}
```

**Response:**

```json
{
  "success": true,
  "spin": {
    "baseAmount": 547,
    "multiplier": 10,
    "boostedAmount": 5470,
    "streakBonus": 25,
    "luckyHourBonus": 20,
    "bonusAmount": 2461,
    "shareBonus": 0,
    "firstSpinBonus": true,
    "finalAmount": 7931,
    "transferDigest": "ABC..."
  },
  "streak": {
    "currentStreak": 7,
    "streakBonus": 25
  },
  "luckyHour": true
}
```

### 2. List User Boosters

```
GET /boosters/:network/boosters/:walletAddress
```

**Response:**

```json
{
  "boosters": [
    {
      "_id": "65f...",
      "tier": "EPIC",
      "multiplier": 10,
      "source": "ATTACK_SCORE_90_99",
      "status": "active",
      "earnedAt": "2026-03-03T...",
      "expiresAt": "2026-03-17T...",
      "tierInfo": {
        "name": "Epic",
        "minReward": 1000,
        "maxReward": 10000
      }
    }
  ],
  "stats": {
    "active": 3,
    "redeemed": 12,
    "expired": 2,
    "totalEarned": 17
  }
}
```

```
GET /boosters/:network/feed?limit=50
```

**Response:**

```json
{
  "spins": [
    {
      "walletAddress": "0xAb3...7f2",
      "tier": "LEGENDARY",
      "multiplier": 25,
      "finalAmount": 21175,
      "spunAt": "2026-03-03T..."
    }
  ]
}
```
