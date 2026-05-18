const { google } = require("googleapis");

// 1. Initialize the OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.EMAIL_OAUTH_CLIENT_ID,
  process.env.EMAIL_OAUTH_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" 
);

// 2. Inject your long-lived refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.EMAIL_OAUTH_REFRESH_TOKEN,
});

/**
 * Helper to construct an RFC 2822 compliant raw email string and base64url encode it
 */
const createRawEmail = (to, subject, html) => {
  const fromName = "Verbis AI";
  const fromEmail = process.env.EMAIL_USER;

  // Construct standard MIME headers and body
  const messageParts = [
    `From: "${fromName}" <${fromEmail}>`,
    `To: ${to}`,
    `Content-Type: text/html; charset=utf-8`,
    `MIME-Version: 1.0`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`, // Safely encodes special subject characters
    "",
    html,
  ];

  const message = messageParts.join("\r\n");

  // Gmail API requires base64url encoding (replacing +, /, and =)
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Generic Mail Sender using Native Gmail API v1
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML
 */
const sendMail = async (to, subject, html) => {
  try {
    // 3. Initialize the Gmail instance using our authenticated OAuth2 Client
    // This automatically handles access token refreshing behind the scenes!
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const rawMessage = createRawEmail(to, subject, html);

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });

    // Returns an object containing the message ID and thread ID
    return response.data;
  } catch (error) {
    console.error("Gmail API Error:", error.response ? error.response.data : error);
    throw new Error("Failed to send email via Google API");
  }
};

/**
 * Sends a contextual OTP email using the native Google API transporter
 * @param {string} email - Recipient email address
 * @param {string} otp - The 6-digit numeric string code
 * @param {'register' | 'reset'} type - The context flow ('register' or 'reset')
 */
const sendOTPEmail = async (email, otp, type = "register") => {
  let subject = "Verify Your Verbis AI Account";
  let headingText = "Verification Code";

  // Conditionally adjust the content based on the application flow context
  switch (type) {
    case "reset":
      subject = "Reset Your Verbis AI Password";
      headingText = "Password Reset Code";
      break;
    case "register":
    default:
      subject = "Verify Your Verbis AI Account";
      headingText = "Account Verification Code";
      break;
  }

  const html = `
  <div style="background-color: #fcfcf9; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; text-align: center; color: #1a1a1a;">
    <div style="max-w: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e0; padding: 40px 30px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
      
      <!-- Premium Branding Top Bar Accent -->
      <div style="display: inline-block; width: 40px; height: 40px; background-color: #1a1a1a; color: #ffffff; line-height: 40px; font-size: 18px; font-weight: 900; margin-bottom: 24px; text-align: center;">
        V
      </div>
      
      <!-- Typographic Branding Header -->
      <h2 style="font-family: Georgia, serif; font-size: 28px; font-weight: 900; letter-spacing: -0.03em; color: #1a1a1a; margin: 0 0 6px 0; font-style: italic; text-transform: lowercase;">
        verbis <span style="color: #da251d;">ai</span>
      </h2>
      
      <p style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.25em; color: #71717a; margin: 0 0 35px 0;">
        ${headingText}
      </p>

      <hr style="border: 0; border-top: 1px solid #e5e5e0; margin-bottom: 30px;" />

      <!-- Core Content -->
      <p style="font-size: 14px; font-weight: 500; line-height: 1.6; color: #404040; margin: 0 0 30px 0; letter-spacing: -0.01em;">
        A transactional security request was initiated. Use the single-use system validation key below to proceed with your verification flow.
      </p>

      <!-- High Contrast OTP Block -->
      <div style="background-color: #1a1a1a; display: inline-block; padding: 16px 36px; margin-bottom: 30px; box-shadow: 0 10px 25px rgba(26,26,26,0.15);">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #ffffff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; padding-left: 0.25em;">${otp}</span>
      </div>

      <hr style="border: 0; border-top: 1px solid #e5e5e0; margin-bottom: 25px;" />

      <!-- Footer Context Flags -->
      <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; margin: 0 0 8px 0;">
        Confidential Security Token
      </p>
      <p style="font-size: 11px; font-weight: 500; color: #a1a1aa; margin: 0; line-height: 1.4;">
        This token is strictly dynamic and parameters will permanently expire in <span style="color: #1a1a1a; font-weight: 700;">5 minutes</span>.<br />
        If you did not authorize this action, please ignore this transmission.
      </p>

    </div>
  </div>
`;

  return await sendMail(email, subject, html);
};

module.exports = { sendMail, sendOTPEmail };