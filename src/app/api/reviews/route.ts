import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  try {
    let query = supabase.from('product_reviews').select('*').order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return NextResponse.json({ success: true, reviews: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { productId, rating, comment, imageUrl } = body;

    if (!productId || !rating) {
      return NextResponse.json({ error: "Faltan datos (producto o calificación)" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión para dejar una reseña" }, { status: 401 });
    }

    // Verify if user purchased the product AND the order is concluded
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('items, status')
      .eq('user_id', user.id);

    if (ordersError) throw ordersError;

    let hasPurchased = false;
    if (orders && orders.length > 0) {
      for (const order of orders) {
        if (order.status === 'concluida') {
          if (order.items && Array.isArray(order.items)) {
            const found = order.items.find((item: any) => item.productId === productId);
            if (found) {
              hasPurchased = true;
              break;
            }
          }
        }
      }
    }

    if (!hasPurchased) {
      return NextResponse.json({ error: "Solo los clientes que han comprado este producto y su pedido está 'concluido' pueden dejar una reseña" }, { status: 403 });
    }

    // Check if already reviewed
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: "Ya has dejado una reseña para este producto" }, { status: 400 });
    }

    let userName = "Usuario verificado";
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    if (profile?.full_name) userName = profile.full_name;
    else if (user.email) userName = user.email.split('@')[0];

    const { data, error } = await supabase.from('product_reviews').insert([{
      product_id: productId,
      user_id: user.id,
      user_name: userName,
      rating: parseInt(rating),
      comment: comment || null,
      image_url: imageUrl || null
    }]).select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, review: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
