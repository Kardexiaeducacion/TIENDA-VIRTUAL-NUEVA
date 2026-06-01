import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { items, totalPrice, shippingCost, finalTotal } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    // 1. Obtener usuario (opcional si está logueado)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Crear Orden (Intento)
    const orderData = {
      user_id: user?.id || null,
      total_amount: finalTotal,
      status: "en proceso",
      // Si la tabla tiene una columna para los items, aquí iría. 
      // Por ahora lo insertamos básico para no romper si no existen las columnas de items
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.warn("No se pudo crear la orden (quizás falta user_id o tabla no tiene la estructura esperada)", orderError);
    }

    // 3. Descontar Stock
    for (const item of items) {
      // Obtener producto actual
      const { data: product } = await supabase
        .from('products')
        .select('stock, variants')
        .eq('id', item.productId)
        .single();

      if (product) {
        let newGeneralStock = (product.stock || 0) - item.quantity;
        if (newGeneralStock < 0) newGeneralStock = 0;

        let updatePayload: any = { stock: newGeneralStock };

        // Descontar de variante si aplica
        if (item.variantId && product.variants && Array.isArray(product.variants)) {
          const newVariants = product.variants.map((v: any) => {
            if (v.id === item.variantId) {
              let vStock = v.stock - item.quantity;
              return { ...v, stock: vStock < 0 ? 0 : vStock };
            }
            return v;
          });
          updatePayload.variants = newVariants;
        }

        // Actualizar en base de datos
        await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', item.productId);
      }
    }

    return NextResponse.json({ success: true, order });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
