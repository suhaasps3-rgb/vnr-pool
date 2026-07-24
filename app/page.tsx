import { createClient } from "@/lib/supabase/server";
import MainCoordinator from "@/components/MainCoordinator";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
    profile = data;
  }

  return <MainCoordinator 
    initialUserId={user?.id || null} 
    initialProfileCompleted={profile?.profile_completed || false} 
  />;
}
