import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, title, message } = body;

    if (!targetUserId || !title || !message) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
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
