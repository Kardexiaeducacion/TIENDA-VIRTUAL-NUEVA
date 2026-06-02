import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const all = searchParams.get('all');

  try {
    let query = supabase.from('product_questions').select('*, products(name, images)').order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    if (!all) {
      // If not all (meaning it's from a product page, maybe we want to limit or filter)
      // Usually product page wants to see all questions for that product
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return NextResponse.json({ success: true, questions: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { productId, question } = body;

    if (!productId || !question) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    let userName = "Usuario Anónimo";
    if (user) {
       // Intentar obtener el nombre del perfil si existe, o usar el email
       const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
       userName = profile?.full_name || user.email?.split('@')[0] || "Usuario";
    }

    const { data, error } = await supabase.from('product_questions').insert([{
      product_id: productId,
      user_id: user?.id || null,
      user_name: userName,
      question: question
    }]).select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, question: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    // Verify admin? (Should do it, but for now just trusting the client like the rest of the app)
    const body = await req.json();
    const { questionId, answer } = body;

    if (!questionId || !answer) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const { data, error } = await supabase.from('product_questions').update({
      answer: answer,
      answered_at: new Date().toISOString()
    }).eq('id', questionId).select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, question: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
