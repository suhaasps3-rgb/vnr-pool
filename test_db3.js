const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://owmhjrhzmaiwutkqsuhb.supabase.co',
  'sb_publishable_w0aVA2yFcGxv26Gv_8ah8Q_CZB3quzd'
);

async function main() {
  const userId = 'acd0586b-187a-4c19-a034-13da246fac4f'; // Sathvika

  let isActivePassenger = false;
  
  // Try joined query first
  const { data: pBookings, error: err1 } = await supabase.from('bookings').select('id, rides(id, status)').eq('passenger_id', userId).in('status', ['approved', 'pending']);
  if (pBookings && pBookings.some((b) => b.rides && (b.rides.status === 'active' || b.rides.status === 'in_progress'))) {
    isActivePassenger = true;
  }

  let rawFallbackTriggered = false;
  // FALLBACK: Raw JS cross-reference just in case joined query fails on this specific Supabase instance
  if (!isActivePassenger) {
    const { data: rawBookings, error: err2 } = await supabase.from('bookings').select('ride_id, status').eq('passenger_id', userId);
    const activeRaw = rawBookings?.filter(b => b.status === 'approved' || b.status === 'pending') || [];
    if (activeRaw.length > 0) {
      const rIds = activeRaw.map(b => b.ride_id);
      const { data: allRidesRaw, error: err3 } = await supabase.from('rides').select('id, status');
      if (allRidesRaw) {
        const passengerRides = allRidesRaw.filter(r => rIds.includes(r.id));
        if (passengerRides.some(r => r.status === 'active' || r.status === 'in_progress')) {
          isActivePassenger = true;
          rawFallbackTriggered = true;
        }
      }
    }
  }

  console.log("isActivePassenger:", isActivePassenger);
  console.log("Joined query returned:", pBookings);
  console.log("Raw fallback triggered?", rawFallbackTriggered);
}

main().catch(console.error);
