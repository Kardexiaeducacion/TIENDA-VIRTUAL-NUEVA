import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { chatId, message, senderType } = body;

    if (!chatId || !message || !senderType) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Insert message
    const { data, error } = await supabase.from('chat_messages').insert([{
      chat_id: chatId,
      sender_type: senderType, // 'user' or 'admin'
      sender_id: user?.id || null,
      message
    }]).select().single();

    if (error) throw error;

    // Update last_message_at in support_chats
    await supabase.from('support_chats').update({
      last_message_at: new Date().toISOString()
    }).eq('id', chatId);

    return NextResponse.json({ success: true, message: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
