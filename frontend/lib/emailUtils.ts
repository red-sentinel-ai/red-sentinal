import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { X_URL, SUI_SENTINEL_TELEGRAM_URL } from '@/constants'

const sesClient = new SESClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: process.env.AWS_REGION || 'us-east-1',
})

const FROM_ADDRESS = process.env.AWS_FROM_EMAIL || 'updates@suisentinel.xyz'
const APP_URL = process.env.NEXTAUTH_URL || 'https://app.redsentinel.xyz'

const SENTINEL_PINK = '#F445AB'
const TEXT_GRAY = '#5F5C5C'
const BG_GRAY = '#F5F5F5'
const LOGO_URL = `${APP_URL}/icons/logo_large.svg`

export async function sendEmailVerificationLink(toEmail: string, verificationUrl: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email – Red Sentinel</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${BG_GRAY}; color: #000000;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: ${BG_GRAY}; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #EAEAEA;">

              <tr>
                <td align="center" style="padding: 40px 40px 20px 40px;">
                  <img src="${LOGO_URL}" alt="Red Sentinel" width="180" style="display: block; border: 0; max-width: 100%; height: auto;" />
                </td>
              </tr>

              <tr>
                <td align="center" style="padding: 0 40px;">
                  <div style="height: 1px; width: 100%; background-color: #EAEAEA;"></div>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px 40px;">
                  <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center; letter-spacing: -0.5px;">
                    Verify your <span style="color: ${SENTINEL_PINK};">Email</span>
                  </h1>

                  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${TEXT_GRAY}; text-align: center;">
                    Click the button below to connect <strong>${toEmail}</strong> to your Red Sentinel profile.
                  </p>

                  <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: ${TEXT_GRAY}; text-align: center;">
                    This link expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td align="center" style="padding: 8px 0 24px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; background-color: ${SENTINEL_PINK}; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; letter-spacing: 0.3px;">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #999999; text-align: center;">
                    Or copy and paste this URL into your browser:<br/>
                    <a href="${verificationUrl}" style="color: ${SENTINEL_PINK}; word-break: break-all;">${verificationUrl}</a>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background-color: #111111; padding: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #666666;">© 2026 Red Sentinel. All Rights Reserved.</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #444444;">Securing the future of On-Chain AI.</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px; margin-top: 20px;">
              <tr>
                <td align="center">
                  <a href="${X_URL}" style="font-size: 12px; color: #888888; text-decoration: none; margin: 0 10px;">Twitter</a>
                  <a href="${SUI_SENTINEL_TELEGRAM_URL}" style="font-size: 12px; color: #888888; text-decoration: none; margin: 0 10px;">Telegram</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const command = new SendEmailCommand({
    Source: FROM_ADDRESS,
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Subject: { Data: 'Verify your email – Red Sentinel', Charset: 'UTF-8' },
      Body: {
        Html: { Data: htmlContent, Charset: 'UTF-8' },
        Text: {
          Data: `Verify your email address\n\nClick the link below to connect ${toEmail} to your Red Sentinel profile. This link expires in 15 minutes.\n\n${verificationUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\n© 2026 Red Sentinel.`,
          Charset: 'UTF-8',
        },
      },
    },
  })

  try {
    const response = await sesClient.send(command)
    return { success: true, messageId: response.MessageId }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error }
  }
}
