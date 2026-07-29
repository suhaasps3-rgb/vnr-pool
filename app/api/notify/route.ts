import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

// ── In-Memory Rate Limiter ────────────────────────────────
// Max 30 requests per user per 60-second window
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(identifier) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  rateLimitMap.set(identifier, timestamps);
  return false;
}

// Basic HTML sanitizer to prevent injection
function sanitizeString(str: string, maxLength: number = 200): string {
  if (!str) return '';
  return str.replace(/[<&>]/g, function (c) {
    return {'<': '&lt;', '>': '&gt;', '&': '&amp;'}[c] as string;
  }).substring(0, maxLength);
}


try { 
  webpush.setVapidDetails(
    'mailto:support@vnrpool.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
  ); 
} catch (e) { 
  console.warn('VAPID keys missing during build'); 
}

export async function POST(request: Request) {
  try {
    // ── Payload Size Check ────────────────────────────────
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 4096) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Rate Limiting ─────────────────────────────────────
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitIdentifier = `${ip}-${user.id}`;
    
    if (isRateLimited(rateLimitIdentifier)) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }

    // Sanitize and validate inputs
    const targetUserId = typeof body.targetUserId === 'string' ? body.targetUserId.trim() : '';
    const title = typeof body.title === 'string' ? sanitizeString(body.title, 100) : '';
    const message = typeof body.message === 'string' ? sanitizeString(body.message, 500) : '';

    if (!targetUserId || !title || !message) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(targetUserId)) {
      return NextResponse.json({ error: 'Invalid target user ID' }, { status: 400 });
    }

    const { data: targetUser, error } = await supabase.auth.admin.getUserById(targetUserId);
    if (error || !targetUser?.user?.user_metadata?.push_subscription) {
       return NextResponse.json({ success: false, message: 'User not subscribed to push' });
    }
    
    let subStr = targetUser.user.user_metadata.push_subscription;
    if (typeof subStr === 'string') {
      const subscription = JSON.parse(subStr);
      await webpush.sendNotification(subscription, JSON.stringify({ title, body: message }));
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Web push API error", error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
  return NextResponse.json({ success: false });
}
