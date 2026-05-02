const nodemailer = require("nodemailer");

// reusable transporter with Connection Pooling
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true, // Crucial for sending multiple newsletter emails efficiently
  maxConnections: 3,
  maxMessages: 100,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
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