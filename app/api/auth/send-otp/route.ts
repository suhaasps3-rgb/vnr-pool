import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { email, type, password } = await req.json();

    if (!email || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate the OTP/Link via Supabase Admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: type, // 'signup' or 'recovery'
      email: email,
      password: password || undefined,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { email_otp, action_link } = data.properties;

    // Prepare email content based on type
    let subject = '';
    let html = '';

    if (type === 'signup') {
      subject = 'Confirm your email for VNR Pool';
      html = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Welcome to VNR Pool!</h2>
          <p>Please confirm your email address by clicking the link below:</p>
          <a href="${action_link}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin-top: 10px;">Confirm Email</a>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `;
    } else if (type === 'recovery') {
      subject = 'Reset your VNR Pool password';
      html = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2>Reset Your Password</h2>
          <p>Your 8-digit OTP for resetting your password is:</p>
          <h1 style="letter-spacing: 4px; background: #f3f4f6; padding: 16px; border-radius: 8px; color: #111;">${email_otp}</h1>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `;
    }

    // Send the email directly using nodemailer
    await transporter.sendMail({
      from: `"VNR Pool" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: subject,
      html: html,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
