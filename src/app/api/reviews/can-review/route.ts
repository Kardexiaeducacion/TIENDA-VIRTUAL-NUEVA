import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: "Falta el productId" }, { status: 400 });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Si no hay sesión, obviamente no puede comentar
    if (!user) {
      return NextResponse.json({ canReview: false, reason: "no_session" });
    }

    // Revisar si YA dejó una reseña
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      return NextResponse.json({ canReview: false, reason: "already_reviewed" });
    }

    // Verificar historial de compras Y que el status sea 'concluida'
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('items, status')
      .eq('user_id', user.id);

    if (ordersError) throw ordersError;

    let hasPurchasedAndCompleted = false;
    let hasPurchasedButNotCompleted = false;

    if (orders && orders.length > 0) {
      for (const order of orders) {
        if (order.items && Array.isArray(order.items)) {
          const found = order.items.find((item: any) => item.productId === productId);
          if (found) {
            if (order.status === 'concluida') {
              hasPurchasedAndCompleted = true;
              break;
            } else {
              hasPurchasedButNotCompleted = true;
            }
          }
        }
      }
    }

    if (hasPurchasedAndCompleted) {
      return NextResponse.json({ canReview: true });
    } else if (hasPurchasedButNotCompleted) {
      return NextResponse.json({ canReview: false, reason: "not_completed" });
    } else {
      return NextResponse.json({ canReview: false, reason: "not_purchased" });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
