# Backend API Specification: Social Missions Telegram Integration

## Overview
This document specifies the backend API endpoint for receiving social mission submissions from the frontend and sending notifications to a Telegram channel/group for admin review and approval.

## Endpoint

### POST `/rewards/social-missions/notify`

Receives social mission submission data from the frontend and sends a formatted notification to Telegram for admin review.

---

## Authentication

**Header**: `x-admin-token`
- **Required**: Yes
- **Type**: String
- **Description**: Admin API token for authentication
- **Value**: Must match `BACKEND_API_ADMIN_TOKEN` environment variable

---

## Request Body

### Schema

```typescript
{
  submission_id: string;        // Unique ID from ss_rewards_activity table
  mission_type: string;         // Mission type identifier
  mission_label: string;        // Human-readable mission name
  user: {
    username: string;           // User's display name (from ss_users)
    wallet_address: string;     // User's Sui wallet address
  };
  proof: {
    username?: string;          // Twitter/X username (without @)
    telegram_username?: string; // Telegram username (without @)
    content_link?: string;      // URL to tweet, article, video, etc.
    screenshot_url?: string;    // URL to uploaded screenshot (optional)
  };
  network: string;              // "testnet" or "mainnet"
  submitted_at: string;         // ISO 8601 timestamp
}
```

### Mission Types

| Type | Label | Required Fields |
|------|-------|----------------|
| `follow_x` | Follow Red Sentinel on X | `proof.username` |
| `join_telegram` | Join Red Sentinel Telegram | `proof.telegram_username` |
| `retweet` | Retweet a Red Sentinel post | `proof.content_link` |
| `share_with_hashtag` | Share with #RedSentinel | `proof.content_link` |
| `share_content` | Share Red Sentinel Content | `proof.content_link` |

### Example Request

```json
{
  "submission_id": "550e8400-e29b-41d4-a716-446655440000",
  "mission_type": "retweet",
  "mission_label": "Retweet a Red Sentinel post",
  "user": {
    "username": "crypto_enthusiast",
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678"
  },
  "proof": {
    "username": "crypto_enthusiast",
    "content_link": "https://x.com/crypto_enthusiast/status/1234567890",
    "screenshot_url": "https://storage.example.com/screenshots/abc123.png"
  },
  "network": "testnet",
  "submitted_at": "2024-03-06T12:34:56.789Z"
}
```

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Notification sent to Telegram"
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Invalid or missing admin token"
}
```

#### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to send Telegram notification"
}
```

---

## Telegram Integration

### Bot Configuration

The backend should use a Telegram Bot to send notifications to a designated admin channel/group.

**Environment Variables Required:**
- `TELEGRAM_BOT_TOKEN`: Bot API token from @BotFather
- `TELEGRAM_ADMIN_CHAT_ID`: Channel/group chat ID for notifications

### Message Format

The Telegram notification should include:

1. **Header**: Mission type and submission ID
2. **User Info**: Username and wallet address
3. **Proof Details**: All submitted proof data with clickable links
4. **Inline Keyboard**: Approve/Reject buttons

#### Example Telegram Message

```
🔔 NEW MISSION SUBMISSION

📋 Mission: Retweet a Red Sentinel post
🆔 Submission ID: 550e8400-e29b-41d4-a716-446655440000

👤 User: crypto_enthusiast
💼 Wallet: 0x1234...5678

📍 Proof:
• Username: @crypto_enthusiast
• Tweet: https://x.com/crypto_enthusiast/status/1234567890
• Screenshot: https://storage.example.com/screenshots/abc123.png

🌐 Network: testnet
⏰ Submitted: 2024-03-06 12:34:56 UTC

[Approve ✅] [Reject ❌]
```

---

## Telegram Bot Commands & Callbacks

### Inline Keyboard Callbacks

The approve/reject buttons should use callback data:

```typescript
// Approve button callback_data
`approve:${submission_id}`

// Reject button callback_data
`reject:${submission_id}`
```

### Callback Handler Logic

When an admin clicks a button:

1. **Verify admin**: Check if user has admin permissions
2. **Update database**: Update `ss_rewards_activity` table
   - Set `metadata.status` to `"approved"` or `"rejected"`
   - Add `metadata.reviewed_by` with admin's Telegram ID
   - Add `metadata.reviewed_at` with current timestamp
3. **Award points** (if approved):
   - Fetch mission points from configuration
   - Update `ss_rewards_leaderboard` for the user
   - Add points to `total_points` and `lifetime_points`
4. **Edit Telegram message**: Update the original message to show decision
5. **Notify user** (optional): Send confirmation to user via Telegram if they're in the channel

### Example Database Update (Approve)

```typescript
// Update ss_rewards_activity
UPDATE ss_rewards_activity
SET
  points_earned = 20,  // Fetch from mission config
  metadata = jsonb_set(
    jsonb_set(
      jsonb_set(
        metadata,
        '{status}',
        '"approved"'
      ),
      '{reviewed_by}',
      '"123456789"'  // Telegram admin ID
    ),
    '{reviewed_at}',
    '"2024-03-06T12:45:00.000Z"'
  )
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

// Update ss_rewards_leaderboard
UPDATE ss_rewards_leaderboard
SET
  total_points = total_points + 20,
  lifetime_points = lifetime_points + 20
WHERE user_id = 'user-uuid-here';
```

### Updated Telegram Message (After Approval)

```
✅ APPROVED

📋 Mission: Retweet a Red Sentinel post
🆔 Submission ID: 550e8400...

👤 User: crypto_enthusiast
💼 Wallet: 0x1234...5678

📍 Proof:
• Username: @crypto_enthusiast
• Tweet: https://x.com/crypto_enthusiast/status/1234567890

🎁 Points Awarded: 20 SENTINEL
👮 Reviewed by: @admin_username
⏰ Reviewed at: 2024-03-06 12:45:00 UTC
```

---

## Error Handling

### Frontend Retry Logic
The frontend uses `.catch()` to silently handle notification failures, as the submission is already saved to the database. The backend should:
- Log all errors for monitoring
- Return appropriate error codes
- Ensure idempotency (handle duplicate submissions gracefully)

### Telegram API Failures
If Telegram API is unavailable:
1. Return 500 error to frontend (will be caught and logged)
2. Consider implementing a retry queue for failed notifications
3. Log error details for admin investigation

---

## Database Schema Reference

### ss_rewards_activity

```sql
CREATE TABLE ss_rewards_activity (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_type VARCHAR NOT NULL,
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,  -- Contains: status, username, telegram_username, content_link, screenshot_url, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ss_rewards_leaderboard

```sql
CREATE TABLE ss_rewards_leaderboard (
  user_id UUID PRIMARY KEY,
  total_points BIGINT DEFAULT 0,
  lifetime_points BIGINT DEFAULT 0,
  tier VARCHAR,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Security Considerations

1. **Authentication**: Always verify `x-admin-token` before processing
2. **Validation**: Validate all URLs to prevent XSS or phishing
3. **Rate Limiting**: Implement rate limits to prevent spam
4. **Admin Verification**: Only allow authorized Telegram users to approve/reject
5. **Audit Trail**: Log all approval/rejection actions with timestamps and admin IDs

---

## Testing

### Manual Testing Checklist

- [ ] Submit mission from frontend
- [ ] Verify Telegram notification received
- [ ] Click "Approve" button
- [ ] Verify database updated correctly
- [ ] Verify points awarded to user
- [ ] Verify Telegram message updated
- [ ] Click "Reject" button on another submission
- [ ] Verify rejection recorded in database
- [ ] Test with missing/invalid auth token
- [ ] Test with malformed request body
- [ ] Test Telegram API failure scenario

### Example cURL Request

```bash
curl -X POST https://api.suisentinel.com/rewards/social-missions/notify \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-admin-token-here" \
  -d '{
    "submission_id": "550e8400-e29b-41d4-a716-446655440000",
    "mission_type": "retweet",
    "mission_label": "Retweet a Red Sentinel post",
    "user": {
      "username": "test_user",
      "wallet_address": "0x1234567890abcdef"
    },
    "proof": {
      "username": "test_user",
      "content_link": "https://x.com/test_user/status/123"
    },
    "network": "testnet",
    "submitted_at": "2024-03-06T12:00:00.000Z"
  }'
```

---

## Future Enhancements

1. **Auto-verification**: For certain mission types (e.g., follow_x), integrate with Twitter API to auto-verify and approve
2. **Batch approvals**: Allow admins to approve multiple submissions at once
3. **Analytics**: Track approval rates, common rejection reasons, average review time
4. **User notifications**: Send Telegram/email notifications to users when submissions are reviewed
5. **Web dashboard**: Create admin web interface as alternative to Telegram

---

## Support & Contact

For questions or issues with this API:
- Create an issue in the backend repository
- Contact the backend team via Telegram admin channel
