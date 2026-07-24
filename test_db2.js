const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://owmhjrhzmaiwutkqsuhb.supabase.co',
  'sb_publishable_w0aVA2yFcGxv26Gv_8ah8Q_CZB3quzd'
);

async function main() {
  const rideIds = ['e8e2014a-bd64-43b9-9705-60ba61f63eb2', 'cdcfb705-5f62-4716-8e2d-bebaed8cac7d'];
  const { data: rides, error } = await supabase.from('rides').select('*').in('id', rideIds);
  console.log(rides);
}

main().catch(console.error);
