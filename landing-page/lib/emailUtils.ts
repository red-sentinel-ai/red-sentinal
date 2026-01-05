import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const SES_CONFIG = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  region: process.env.AWS_REGION || "us-east-1",
};

const sesClient = new SESClient(SES_CONFIG);

export const sendManifestoConfirmationEmail = async (toEmail: string) => {
  const fromAddress = process.env.AWS_FROM_EMAIL || "updates@suisentinel.xyz";

  if (!fromAddress) {
    throw new Error("AWS_FROM_EMAIL is not defined in environment variables");
  }

  const sentinelPink = "#F445AB";
  const bgGray = "#F5F5F5";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: ${bgGray}; color: #000000;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #000000; padding: 40px;">
          
          <div style="margin-bottom: 30px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Sui Sentinel</h1>
          </div>

          <h2 style="font-size: 28px; font-weight: 500; margin-bottom: 20px; line-height: 1.2;">
            Oath <span style="color: ${sentinelPink};">Accepted.</span>
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 24px;">
            You have successfully signed the Sentinel Manifesto. You are now part of the 
            guardians protecting intelligence in the age of artificial minds.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333333; margin-bottom: 40px;">
            We will notify you when new Sentinels are deployed or when the arena needs your defense.
          </p>

          <div style="border-top: 1px solid #EAEAEA; margin-bottom: 30px;"></div>

          <p style="font-size: 12px; color: #666666; text-align: center;">
            © 2025 Sui Sentinel. All Rights Reserved.<br/>
            Securing the future of On-Chain AI.
          </p>
        </div>
      </body>
    </html>
  `;

  const command = new SendEmailCommand({
    Source: fromAddress,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: "Sui Sentinel: Manifesto Signed",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
        Text: {
          Data: "Oath Accepted. You have successfully signed the Sentinel Manifesto. Welcome to the guardians.",
          Charset: "UTF-8",
        },
      },
    },
  });

  try {
    const response = await sesClient.send(command);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error("Failed to send SES email:", error);
    return { success: false, error };
  }
};
