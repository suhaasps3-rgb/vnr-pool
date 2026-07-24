const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://owmhjrhzmaiwutkqsuhb.supabase.co',
  'sb_publishable_w0aVA2yFcGxv26Gv_8ah8Q_CZB3quzd'
);

async function main() {
  const { data: rides, error: ridesError } = await supabase.from('rides').select('*').in('status', ['active', 'in_progress']);
  console.log('--- ALL RIDES ---');
  console.log(rides);
  if (ridesError) console.error('Rides error:', ridesError);

  const { data: bookings, error: bookingsError } = await supabase.from('bookings').select('*');
  console.log('\n--- ALL BOOKINGS ---');
  console.log(bookings);
  if (bookingsError) console.error('Bookings error:', bookingsError);

  const { data: users, error: usersError } = await supabase.from('users').select('*');
  console.log('\n--- ALL USERS ---');
  console.log(users);
  if (usersError) console.error('Users error:', usersError);
}

main().catch(console.error);
