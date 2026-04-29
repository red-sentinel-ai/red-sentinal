import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SUI_SENTINEL_LANDING_PAGE_URL } from "@/constants";

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

  const logoUrl = `${SUI_SENTINEL_LANDING_PAGE_URL}/icons/logo/logo_dark.png`;
  const sentinelPink = "#F445AB";
  const textBlack = "#000000";
  const textGray = "#5F5C5C";
  const bgGray = "#F5F5F5";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Red Sentinel Manifesto</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${bgGray}; color: ${textBlack};">
      
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: ${bgGray}; padding: 40px 20px;">
        <tr>
          <td align="center">
            
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #EAEAEA;">
              
              <tr>
                <td align="center" style="padding: 40px 40px 20px 40px;">
                  <img src="${logoUrl}" alt="Red Sentinel" width="180" style="display: block; border: 0; max-width: 100%; height: auto;" />
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
                    The Oath is <span style="color: ${sentinelPink};">Sealed.</span>
                  </h1>
                  
                  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${textGray}; text-align: center;">
                    Welcome, Guardian.
                  </p>

                  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${textGray}; text-align: center;">
                    You have successfully signed the <strong>Red Sentinel Manifesto</strong>. You have joined a legion of defenders committed to protecting intelligence in the age of artificial minds.
                  </p>

                  <div style="background-color: #FAFAFA; border: 1px dashed #CCCCCC; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Signed By</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 500; color: ${textBlack};">${toEmail}</p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background-color: #111111; padding: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #666666;">
                    © 2025 Red Sentinel. All Rights Reserved.
                  </p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #444444;">
                    Securing the future of On-Chain AI.
                  </p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px; margin-top: 20px;">
              <tr>
                <td align="center">
                  <a href="https://x.com/redsentinel_ai" style="font-size: 12px; color: #888888; text-decoration: none; margin: 0 10px;">Twitter</a>
                  <a href="https://t.me/suisentinel" style="font-size: 12px; color: #888888; text-decoration: none; margin: 0 10px;">Telegram</a>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
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
        Data: "Oath Accepted: Welcome to the Sentinels",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
        Text: {
          Data: `The Oath is Sealed. Welcome, Guardian.\n\nYou have successfully signed the Red Sentinel Manifesto using ${toEmail}.\n\n© 2025 Red Sentinel.`,
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

export const sendAmbassadorConfirmationEmail = async (toEmail: string) => {
  const fromAddress = process.env.AWS_FROM_EMAIL || "updates@suisentinel.xyz";

  if (!fromAddress) {
    throw new Error("AWS_FROM_EMAIL is not defined in environment variables");
  }

  const logoUrl = `${SUI_SENTINEL_LANDING_PAGE_URL}/icons/logo/logo_dark.png`;
  const sentinelPink = "#F445AB";
  const textBlack = "#000000";
  const textGray = "#5F5C5C";
  const bgGray = "#F5F5F5";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Red Sentinel Ambassador Program</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${bgGray}; color: ${textBlack};">

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: ${bgGray}; padding: 40px 20px;">
        <tr>
          <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #EAEAEA;">

              <tr>
                <td align="center" style="padding: 40px 40px 20px 40px;">
                  <img src="${logoUrl}" alt="Red Sentinel" width="180" style="display: block; border: 0; max-width: 100%; height: auto;" />
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
                    Application <span style="color: ${sentinelPink};">Received.</span>
                  </h1>

                  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${textGray}; text-align: center;">
                    Thank you for applying, Guardian.
                  </p>

                  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${textGray}; text-align: center;">
                    We've received your application for the <strong>Red Sentinel Ambassador Program</strong>. Our team will review your submission and get back to you shortly.
                  </p>

                  <div style="background-color: #FAFAFA; border: 1px dashed #CCCCCC; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Submitted By</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 500; color: ${textBlack};">${toEmail}</p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="background-color: #111111; padding: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #666666;">
                    © 2025 Red Sentinel. All Rights Reserved.
                  </p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #444444;">
                    Securing the future of On-Chain AI.
                  </p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px; margin-top: 20px;">
              <tr>
                <td align="center">
                  <a href="https://x.com/suisentinal" style="font-size: 12px; color: #888888; text-decoration: none; margin: 0 10px;">Twitter</a>
                  <a href="https://x.com/redsentinel_ai" style="font-size: 12px; color: #888888; text-decoration: none; margin: 0 10px;">Telegram</a>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
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
        Data: "Application Received: Red Sentinel Ambassador Program",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
        Text: {
          Data: `Application Received. Thank you for applying, Guardian.\n\nWe've received your application for the Red Sentinel Ambassador Program. Our team will review your submission and get back to you shortly.\n\nSubmitted by: ${toEmail}\n\n© 2025 Red Sentinel.`,
          Charset: "UTF-8",
        },
      },
    },
  });

  try {
    const response = await sesClient.send(command);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error("Failed to send ambassador confirmation email:", error);
    return { success: false, error };
  }
};

export const sendDemoRequestConfirmationEmail = async (toEmail: string, firstName: string) => {
  const fromAddress = process.env.AWS_FROM_EMAIL || "updates@suisentinel.xyz";

  if (!fromAddress) {
    throw new Error("AWS_FROM_EMAIL is not defined in environment variables");
  }

  const logoUrl = `${SUI_SENTINEL_LANDING_PAGE_URL}/icons/logo/logo_dark.png`;
  const sentinelPink = "#F445AB";
  const textBlack = "#000000";
  const textGray = "#5F5C5C";
  const bgGray = "#F5F5F5";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Red Sentinel Enterprise Demo</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${bgGray}; color: ${textBlack};">

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: ${bgGray}; padding: 40px 20px;">
        <tr>
          <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #EAEAEA;">

              <tr>
                <td align="center" style="padding: 40px 40px 20px 40px;">
                  <img src="${logoUrl}" alt="Red Sentinel" width="180" style="display: block; border: 0; max-width: 100%; height: auto;" />
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
                    Demo Request <span style="color: ${sentinelPink};">Received.</span>
                  </h1>

                  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${textGray}; text-align: center;">
                    Hello ${firstName},
                  </p>

                  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${textGray}; text-align: center;">
                    Thank you for your interest in <strong>Red Sentinel Enterprise</strong>. We've received your demo request and our team will reach out within 24-48 hours to schedule your personalized demonstration.
                  </p>

                  <div style="background-color: #FAFAFA; border: 1px dashed #CCCCCC; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; text-align: center;">What to Expect</p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${textGray}; line-height: 1.6;">
                      <li>Live platform walkthrough tailored to your use case</li>
                      <li>Discussion of your AI security requirements</li>
                      <li>Q&A with our product specialists</li>
                      <li>Custom pricing and deployment options</li>
                    </ul>
                  </div>

                  <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${textGray}; text-align: center;">
                    In the meantime, feel free to explore our <a href="${SUI_SENTINEL_LANDING_PAGE_URL}/docs" style="color: ${sentinelPink}; text-decoration: none;">documentation</a> or join our <a href="https://t.me/suisentinel" style="color: ${sentinelPink}; text-decoration: none;">Telegram community</a>.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background-color: #111111; padding: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #666666;">
                    © 2025 Red Sentinel. All Rights Reserved.
                  </p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #444444;">
                    Securing the future of On-Chain AI.
                  </p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px; margin-top: 20px;">
              <tr>
                <td align="center">
                  <a href="https://x.com/redsentinel_ai" style="font-size: 12px; color: #888888; text-decoration: none; margin: 0 10px;">Twitter</a>
                  <a href="https://t.me/suisentinel" style="font-size: 12px; color: #888888; text-decoration: none; margin: 0 10px;">Telegram</a>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
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
        Data: "Demo Request Received | Red Sentinel Enterprise",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlContent,
          Charset: "UTF-8",
        },
        Text: {
          Data: `Demo Request Received.\n\nHello ${firstName},\n\nThank you for your interest in Red Sentinel Enterprise. We've received your demo request and our team will reach out within 24-48 hours to schedule your personalized demonstration.\n\nWhat to Expect:\n- Live platform walkthrough tailored to your use case\n- Discussion of your AI security requirements\n- Q&A with our product specialists\n- Custom pricing and deployment options\n\n© 2025 Red Sentinel.`,
          Charset: "UTF-8",
        },
      },
    },
  });

  try {
    const response = await sesClient.send(command);
    return { success: true, messageId: response.MessageId };
  } catch (error) {
    console.error("Failed to send demo request confirmation email:", error);
    return { success: false, error };
  }
};
