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

// ── In-Memory Rate Limiter ────────────────────────────────
// Max 5 attempts per IP per 15-minute window for auth routes
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

// Basic HTML sanitizer for inputs
function sanitizeString(str: string): string {
  if (!str) return '';
  return str.replace(/[<&>]/g, function (c) {
    return {'<': '&lt;', '>': '&gt;', '&': '&amp;'}[c] as string;
  }).substring(0, 100);
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    // 2. Payload Size Check (Reject if larger than 2KB)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 2048) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const body = await req.json();
    
    // 3. Input Sanitization and Validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const type = typeof body.type === 'string' ? sanitizeString(body.type) : '';
    const password = typeof body.password === 'string' ? body.password : undefined;

    if (!email || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Strict email validation for VNR domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@vnrvjiet\.in$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format or domain' }, { status: 400 });
    }

    // Strict type validation
    if (type !== 'signup' && type !== 'recovery') {
      return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
    }
    
    if (password && (password.length < 6 || password.length > 50)) {
       return NextResponse.json({ error: 'Password length invalid' }, { status: 400 });
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

    let { email_otp, action_link } = data.properties;

    // Force link to the new production URL in case Supabase Site URL is outdated
    if (action_link) {
      const origin = req.headers.get('origin') || 'https://vnr-pool-omega.vercel.app';
      const url = new URL(action_link);
      action_link = action_link.replace(url.origin, origin);
    }

    // Prepare email content based on type
    let subject = '';
    let html = '';

    if (type === 'signup') {
      subject = 'Your VNR Pool Verification Code';
      html = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2>Welcome to VNR Pool!</h2>
          <p>Your 6-digit verification code is:</p>
          <h1 style="letter-spacing: 4px; background: #f3f4f6; padding: 16px; border-radius: 8px; color: #111;">${email_otp}</h1>
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
