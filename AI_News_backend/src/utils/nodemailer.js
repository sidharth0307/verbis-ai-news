const nodemailer = require("nodemailer");

// reusable transporter with Connection Pooling
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Must be false for Port 587
  pool: true, 
  maxConnections: 3,
  maxMessages: 100,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // This allows the connection to upgrade to secure (STARTTLS)
    // without getting stuck on certificate handshakes
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  },
  connectionTimeout: 20000, // Increased to 20s for Render's cold start
  greetingTimeout: 20000,
  socketTimeout: 20000,
  family: 4 //to avoid the IPv6 ENETUNREACH error
});

/**
 * Generic Mail Sender
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML
 */
const sendMail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Verbis AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw new Error("Failed to send email");
  }
};


const sendOTPEmail = async (email, otp) => {
  const subject = "Verify Your Verbis AI Account";
  const html = `
    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
      <h1>Verification Code</h1>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otp}</p>
      <p>This code expires in 5 minutes.</p>
    </div>
  `;
  return await sendMail(email, subject, html);
};

module.exports = { sendMail, sendOTPEmail };