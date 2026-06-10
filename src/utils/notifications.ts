import { createClient } from '@supabase/supabase-js';

// Usamos el cliente de supabase-js con Service Role para saltarnos el RLS al insertar notificaciones.
export const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function notifyUser(userId: string, type: string, title: string, body: string, orderId?: string) {
  const supabase = getAdminSupabase();
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body,
    order_id: orderId || null
  });
}

export async function notifyAdmins(type: string, title: string, body: string, orderId?: string) {
  const supabase = getAdminSupabase();
  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
  
  if (admins && admins.length > 0) {
    const notifications = admins.map(admin => ({
      user_id: admin.id,
      type,
      title,
      body,
      order_id: orderId || null
    }));
    await supabase.from('notifications').insert(notifications);
  }
}
