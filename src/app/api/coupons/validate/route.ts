import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Código de cupón requerido" }, { status: 400 });
    }

    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (!coupon) {
      return NextResponse.json({ error: "El cupón no existe o es inválido" }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ error: "Este cupón ya no está activo" }, { status: 400 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: "Este cupón ha expirado" }, { status: 400 });
    }

    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json({ error: "Este cupón ha alcanzado su límite de usos" }, { status: 400 });
    }

    if (coupon.min_purchase_amount && cartTotal < coupon.min_purchase_amount) {
      return NextResponse.json({ error: `La compra mínima para este cupón es de $${coupon.min_purchase_amount}` }, { status: 400 });
    }

    // Calcular descuento
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = cartTotal * (coupon.discount_value / 100);
    } else {
      discountAmount = coupon.discount_value;
    }

    // Regla anti-abuso: El total de la orden NUNCA puede ser menor a $10 MXN para evitar fallos de pasarela o carritos negativos
    const minimumAllowedTotal = 10;
    
    if (cartTotal - discountAmount < minimumAllowedTotal) {
      discountAmount = cartTotal - minimumAllowedTotal;
    }

    // Si el descuento resultante es menor o igual a 0 por alguna razón extraña, rechazar
    if (discountAmount <= 0) {
      return NextResponse.json({ error: "El descuento no se puede aplicar a este monto" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_amount: discountAmount,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      } 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
