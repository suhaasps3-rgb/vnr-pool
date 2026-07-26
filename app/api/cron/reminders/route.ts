import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendTwilioSMS(toPhone: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNum = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioNum) {
    console.warn("Twilio credentials missing. SMS skipped.");
    return false;
  }

  // Ensure Indian number format if it's 10 digits
  const formattedPhone = toPhone.length === 10 ? `+91${toPhone}` : toPhone;

  const auth = Buffer.from(accountSid + ':' + authToken).toString('base64');
  const data = new URLSearchParams({
    To: formattedPhone,
    From: twilioNum,
    Body: message
  });

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data
    });
    const json = await res.json();
    return res.ok;
  } catch (error) {
    console.error("SMS Error:", error);
    return false;
  }
}

export async function GET(request: Request) {
  // 1. Verify Vercel Cron Secret for security
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' && 
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Define the exact time window: rides departing between 14 and 19 minutes from right now
  const now = new Date();
  const targetStart = new Date(now.getTime() + 14 * 60000);
  const targetEnd = new Date(now.getTime() + 19 * 60000);

  // 3. Fetch all active rides departing in this exact 5-minute window
  const { data: rides, error } = await supabase
    .from('rides')
    .select(`
      id, origin, destination, departure_time,
      driver_id,
      profiles!driver_id(full_name, mobile_number)
    `)
    .eq('status', 'active')
    .gte('departure_time', targetStart.toISOString())
    .lte('departure_time', targetEnd.toISOString());

  if (error || !rides || rides.length === 0) {
    return NextResponse.json({ message: 'No rides to remind', count: 0 });
  }

  let totalSmsSent = 0;

  for (const ride of rides) {
    // We don't want to alert people if the ride is already full or whatever,
    // actually we DO want to alert them, it's just a departure reminder!

    // Get the driver's phone
    const driverPhone = ride.profiles?.mobile_number;
    if (driverPhone) {
      const msg = `VNR Pool: Your ride from ${ride.origin} to ${ride.destination} departs in 15 minutes! Get ready to drive.`;
      await sendTwilioSMS(driverPhone, msg);
      totalSmsSent++;
    }

    // Fetch approved passengers
    const { data: passengers } = await supabase
      .from('ride_requests')
      .select(`
        profiles(full_name, mobile_number)
      `)
      .eq('ride_id', ride.id)
      .eq('status', 'approved');

    if (passengers && passengers.length > 0) {
      for (const pass of passengers) {
        const passPhone = pass.profiles?.mobile_number;
        if (passPhone) {
          const msg = `VNR Pool: Your ride from ${ride.origin} to ${ride.destination} departs in 15 minutes! Head to the pickup location.`;
          await sendTwilioSMS(passPhone, msg);
          totalSmsSent++;
        }
      }
    }
  }

  return NextResponse.json({ message: 'Reminders processed', totalSmsSent });
}
