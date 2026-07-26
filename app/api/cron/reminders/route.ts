import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

webpush.setVapidDetails(
  'mailto:support@vnrpool.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

async function sendWebPush(userId: string, title: string, body: string) {
  try {
    const { data: user, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !user?.user?.user_metadata?.push_subscription) return false;
    
    let subStr = user.user.user_metadata.push_subscription;
    if (typeof subStr === 'string') {
      const subscription = JSON.parse(subStr);
      await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
      return true;
    }
  } catch (e) {
    console.error("Web push error", e);
  }
  return false;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' && 
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const targetStart = new Date(now.getTime() + 14 * 60000);
  const targetEnd = new Date(now.getTime() + 19 * 60000);

  const { data: rides, error } = await supabase
    .from('rides')
    .select(`
      id, origin, destination, departure_time,
      driver_id
    `)
    .eq('status', 'active')
    .gte('departure_time', targetStart.toISOString())
    .lte('departure_time', targetEnd.toISOString());

  if (error || !rides || rides.length === 0) {
    return NextResponse.json({ message: 'No rides to remind', count: 0 });
  }

  let totalPushSent = 0;

  for (const ride of rides) {
    // Notify Driver
    const msg = `Your ride to ${ride.destination} departs in 15 minutes!`;
    const sentDriver = await sendWebPush(ride.driver_id, 'Departure Reminder', msg);
    if (sentDriver) totalPushSent++;

    // Notify Passengers
    const { data: passengers } = await supabase
      .from('ride_requests')
      .select('user_id')
      .eq('ride_id', ride.id)
      .eq('status', 'approved');

    if (passengers && passengers.length > 0) {
      for (const pass of passengers) {
        const sentPass = await sendWebPush(pass.user_id, 'Departure Reminder', `Your ride to ${ride.destination} departs in 15 minutes! Head to the pickup location.`);
        if (sentPass) totalPushSent++;
      }
    }
  }

  return NextResponse.json({ message: 'Reminders processed via Web Push', totalPushSent });
}
