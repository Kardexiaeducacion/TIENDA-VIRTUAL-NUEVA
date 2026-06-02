import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get('activeOnly');

  try {
    let query = supabase.from('help_articles').select('*').order('created_at', { ascending: false });
    if (activeOnly === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return NextResponse.json({ success: true, articles: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { category, question, answer } = body;

    if (!category || !question || !answer) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const { data, error } = await supabase.from('help_articles').insert([{
      category, question, answer
    }]).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, article: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { id, is_active } = body;

    if (!id) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

    const { data, error } = await supabase.from('help_articles').update({
      is_active
    }).eq('id', id).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, article: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

    const { error } = await supabase.from('help_articles').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
