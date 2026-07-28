import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Auto-archive CRON endpoint.
// Vercel cron: schedule in vercel.json as {"path":"/api/cron/archive","schedule":"0 * * * *"}
// Auth: requires CRON_SECRET header in production.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // ── Authorization ────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const now = new Date();

  // ── Phase 1: Auto-complete rides 24h past departure ──────
  // Rides that were active/in_progress and departed > 24h ago get marked completed.
  const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const { data: staleRides, error: fetchError } = await supabase
    .from('rides')
    .select('id, origin, destination, departure_time')
    .in('status', ['active', 'in_progress'])
    .lt('departure_time', cutoff24h);

  if (fetchError) {
    console.error('Archive CRON fetch error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch stale rides' }, { status: 500 });
  }

  let archivedCount = 0;

  if (staleRides && staleRides.length > 0) {
    const staleIds = staleRides.map((r) => r.id);

    // Mark rides as completed
    const { error: updateError } = await supabase
      .from('rides')
      .update({ status: 'completed' })
      .in('id', staleIds);

    if (!updateError) {
      archivedCount = staleIds.length;
    } else {
      console.error('Archive CRON update error:', updateError);
    }

    // Also mark any pending bookings for these rides as cancelled
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .in('ride_id', staleIds)
      .eq('status', 'pending');
  }

  // ── Phase 2: Obfuscate location data after 7 days ────────
  // Protect commute patterns — replace exact addresses with area-level info.
  const cutoff7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: oldRides } = await supabase
    .from('rides')
    .select('id, origin, destination')
    .eq('status', 'completed')
    .lt('departure_time', cutoff7d)
    .not('origin', 'ilike', '%[archived]%'); // avoid re-processing

  let obfuscatedCount = 0;

  if (oldRides && oldRides.length > 0) {
    for (const ride of oldRides) {
      // Truncate to first word/area and mark as archived
      const originArea = ride.origin.split(',')[0].trim();
      const destArea = ride.destination.split(',')[0].trim();

      await supabase
        .from('rides')
        .update({
          origin: `${originArea} [archived]`,
          destination: `${destArea} [archived]`,
        })
        .eq('id', ride.id);

      obfuscatedCount++;
    }
  }

  return NextResponse.json({
    message: 'Archive CRON completed',
    archivedRides: archivedCount,
    obfuscatedRides: obfuscatedCount,
    processedAt: now.toISOString(),
  });
}
