import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Collab Nation" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

// Email templates
export const emailTemplates = {
  verification: (name, link) => `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#08090A;color:#F0EEE9;border-radius:12px;">
      <h2 style="color:#00E5A0;font-size:22px;margin-bottom:8px;">Welcome to Collab Nation 👋</h2>
      <p style="color:#9A9CA5;margin-bottom:24px;">Hi ${name}, please verify your email to get started.</p>
      <a href="${link}" style="display:inline-block;background:#00E5A0;color:#08090A;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;">Verify Email</a>
      <p style="color:#6B6D75;font-size:12px;margin-top:24px;">This link expires in 24 hours.</p>
    </div>`,

  resetPassword: (name, link) => `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#08090A;color:#F0EEE9;border-radius:12px;">
      <h2 style="color:#00E5A0;font-size:22px;margin-bottom:8px;">Reset your password</h2>
      <p style="color:#9A9CA5;margin-bottom:24px;">Hi ${name}, click below to reset your Collab Nation password.</p>
      <a href="${link}" style="display:inline-block;background:#00E5A0;color:#08090A;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;">Reset Password</a>
      <p style="color:#6B6D75;font-size:12px;margin-top:24px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>`,

  newApplication: (recruiterName, candidateName, jobTitle, profileLink) => `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#08090A;color:#F0EEE9;border-radius:12px;">
      <h2 style="color:#00E5A0;font-size:22px;margin-bottom:8px;">New application received 🎉</h2>
      <p style="color:#9A9CA5;margin-bottom:8px;">Hi ${recruiterName},</p>
      <p style="color:#9A9CA5;margin-bottom:24px;"><strong style="color:#F0EEE9;">${candidateName}</strong> applied for <strong style="color:#F0EEE9;">${jobTitle}</strong>.</p>
      <a href="${profileLink}" style="display:inline-block;background:#00E5A0;color:#08090A;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;">View Candidate</a>
    </div>`,

  statusUpdate: (candidateName, jobTitle, status) => `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#08090A;color:#F0EEE9;border-radius:12px;">
      <h2 style="color:#00E5A0;font-size:22px;margin-bottom:8px;">Application update</h2>
      <p style="color:#9A9CA5;margin-bottom:8px;">Hi ${candidateName},</p>
      <p style="color:#9A9CA5;margin-bottom:24px;">Your application for <strong style="color:#F0EEE9;">${jobTitle}</strong> status changed to <strong style="color:#00E5A0;">${status.toUpperCase()}</strong>.</p>
      <a href="${process.env.FRONTEND_URL}/candidate/dashboard" style="display:inline-block;background:#00E5A0;color:#08090A;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;">View Dashboard</a>
    </div>`,
};
