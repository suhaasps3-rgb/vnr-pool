import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

try { webpush.setVapidDetails(
  'mailto:support@vnrpool.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
); } catch (e) { console.warn('VAPID keys missing during build'); }

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
  
  // Generous 10-minute windows to guarantee we never miss a GitHub Action delay
  const targetStart15 = new Date(now.getTime() + 10 * 60000);
  const targetEnd15 = new Date(now.getTime() + 20 * 60000);

  const targetStart5 = new Date(now.getTime() + 0 * 60000);
  const targetEnd5 = new Date(now.getTime() + 9 * 60000);

  const { data: rides, error } = await supabase
    .from('rides')
    .select(`
      id, origin, destination, departure_time,
      driver_id
    `)
    .eq('status', 'active');

  if (error || !rides || rides.length === 0) {
    return NextResponse.json({ message: 'No rides to remind', count: 0 });
  }

  let totalPushSent = 0;

  for (const ride of rides) {
    const depTime = new Date(ride.departure_time);
    let is15Min = depTime >= targetStart15 && depTime <= targetEnd15;
    let is5Min = depTime >= targetStart5 && depTime <= targetEnd5;

    // Skip if not in any window
    if (!is15Min && !is5Min) continue;
    
    // 15-minute takes precedence if it overlaps (though they shouldn't with these windows)
    if (is15Min && is5Min) is5Min = false;

    const title = is15Min ? 'Departure Reminder' : 'Arriving Now';
    const msgDriver = is15Min 
      ? `Your ride to ${ride.destination} departs in 15 minutes!` 
      : `Your ride to ${ride.destination} departs in 5 minutes! Start heading out.`;
    const msgPass = is15Min 
      ? `Your ride to ${ride.destination} departs in 15 minutes! Head to the pickup location.` 
      : `Your ride to ${ride.destination} departs in 5 minutes! The driver is arriving.`;

    // Deduplication check: Have we already sent this exact type of reminder to the driver recently?
    const searchString = is15Min ? '%departs in 15 minutes%' : '%departs in 5 minutes%';
    const { data: existingNotifs } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', ride.driver_id)
      .ilike('message', searchString)
      .gte('created_at', new Date(now.getTime() - 30 * 60000).toISOString());

    if (existingNotifs && existingNotifs.length > 0) {
      // Already sent this reminder type for this ride
      continue;
    }

    // Insert a record so we don't send it again
    await supabase.from('notifications').insert({
      user_id: ride.driver_id,
      message: msgDriver
    });

    // Notify Driver
    const sentDriver = await sendWebPush(ride.driver_id, title, msgDriver);
    if (sentDriver) totalPushSent++;

    // Notify Passengers
    const { data: passengers } = await supabase
      .from('bookings')
      .select('passenger_id')
      .eq('ride_id', ride.id)
      .eq('status', 'approved');

    if (passengers && passengers.length > 0) {
      const passengerNotifications = passengers.map(p => ({
        user_id: p.passenger_id,
        message: msgPass
      }));
      await supabase.from('notifications').insert(passengerNotifications);
      
      for (const pass of passengers) {
        const sentPass = await sendWebPush(pass.passenger_id, title, msgPass);
        if (sentPass) totalPushSent++;
      }
    }
  }

  return NextResponse.json({ message: 'Reminders processed', totalPushSent });
}
