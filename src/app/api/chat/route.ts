import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Create a new chat session or get existing open one
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 1. Check if there's an open chat
    const { data: openChat } = await supabase
      .from('support_chats')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (openChat) {
      return NextResponse.json({ success: true, chat: openChat });
    }

    // 2. If not, create one
    let userName = "Usuario";
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    if (profile?.full_name) userName = profile.full_name;

    const { data: newChat, error } = await supabase.from('support_chats').insert([{
      user_id: user.id,
      user_name: userName,
      user_email: user.email,
      status: 'open'
    }]).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, chat: newChat });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
