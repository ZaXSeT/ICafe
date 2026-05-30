import nodemailer from "nodemailer";

// In a real application, you would store these in environment variables.
// For now, we are going to mock it if they are not provided.
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

export const sendOTP = async (email: string, otp: string) => {
  if (!SMTP_USER || !SMTP_PASS) {
    // Fallback to mock email (console log)
    console.log("\n==============================================");
    console.log("MOCK EMAIL SENT!");
    console.log(`To: ${email}`);
    console.log(`Subject: Your ICafe Verification Code`);
    console.log(`Body:`);
    console.log(`Hello, your verification code is: ${otp}`);
    console.log(`Please enter this code on the verification page.`);
    console.log("==============================================\n");
    return { success: true, message: "Mock email sent" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"ICafe Team" <${SMTP_USER}>`,
      to: email,
      subject: "Your ICafe Verification Code",
      text: `Hello, your verification code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #6D4C41; text-align: center;">Welcome to ICafe!</h2>
          <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; color: #333; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} ICafe. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
};
