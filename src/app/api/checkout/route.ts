import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { items, shippingCost, finalTotal, discountAmount, appliedCoupon, shippingAddress, shippingOption, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: settings } = await supabase.from('store_settings').select('*').limit(1).single();

    // ─── MERCADO PAGO: Checkout Pro ───────────────────────────────────────────
    if (paymentMethod === 'mercadopago') {
      const { data: mpSettings } = await supabase
        .from('payment_settings')
        .select('mp_access_token, access_token')
        .eq('method', 'mercadopago')
        .single();

      const accessToken = mpSettings?.mp_access_token || mpSettings?.access_token;
      if (!accessToken) {
        return NextResponse.json({ error: "Mercado Pago no está vinculado. Ve al panel de Pagos y conecta tu cuenta." }, { status: 400 });
      }

      const { MercadoPagoConfig: MPConfig, Preference } = await import('mercadopago');
      const client = new MPConfig({ accessToken });
      const preference = new Preference(client);

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloe-app-git-main-kardexia-s-projects.vercel.app';

      const shippingDetails = shippingAddress ? {
        ...shippingAddress,
        carrier: shippingOption?.carrier || "N/A",
        service: shippingOption?.service || "N/A",
        shipping_cost: shippingCost || 0
      } : null;

      // Crear la orden primero para tener el ID como referencia en MP
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user?.id || null,
          total_amount: finalTotal,
          status: 'en proceso',
          items: items,
          discount_amount: discountAmount || 0,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          shipping_address: shippingDetails ? JSON.stringify(shippingDetails) : null,
          payment_method: 'mercadopago',
          payment_status: 'pending',
        }])
        .select()
        .single();

      if (orderError) throw new Error("No se pudo crear la orden: " + orderError.message);

      if (appliedCoupon?.id) {
        const { data: cData } = await supabase.from('coupons').select('uses_count').eq('id', appliedCoupon.id).single();
        if (cData) await supabase.from('coupons').update({ uses_count: (cData.uses_count || 0) + 1 }).eq('id', appliedCoupon.id);
      }

      for (const item of items) {
        const { data: product } = await supabase.from('products').select('stock, variants').eq('id', item.productId).single();
        if (product) {
          const newStock = Math.max(0, (product.stock || 0) - item.quantity);
          const updatePayload: any = { stock: newStock };
          if (item.variantId && Array.isArray(product.variants)) {
            updatePayload.variants = product.variants.map((v: any) =>
              v.id === item.variantId ? { ...v, stock: Math.max(0, v.stock - item.quantity) } : v
            );
          }
          await supabase.from('products').update(updatePayload).eq('id', item.productId);
        }
      }

      const prefItems = items.map((item: any) => ({
        id: String(item.productId || item.id || '').slice(0, 256),
        title: String(item.name || item.title || 'Producto').slice(0, 256),
        quantity: item.quantity,
        unit_price: Number((item.price || 0).toFixed(2)),
        currency_id: 'MXN',
      }));

      if ((shippingCost || 0) > 0) {
        prefItems.push({
          id: 'SHIPPING',
          title: `Envío (${shippingOption?.carrier || 'Paquetería'})`,
          quantity: 1,
          unit_price: Number((shippingCost || 0).toFixed(2)),
          currency_id: 'MXN',
        });
      }

      const prefResponse = await preference.create({
        body: {
          items: prefItems,
          payer: shippingAddress?.email ? { email: shippingAddress.email } : undefined,
          back_urls: {
            success: `${baseUrl}/account/orders?mp_success=true`,
            failure: `${baseUrl}/checkout?error=payment_failed`,
            pending: `${baseUrl}/account/orders?mp_pending=true`,
          },
          auto_return: 'approved',
          external_reference: order.id,
          notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        }
      });

      if (!prefResponse.init_point) {
        await supabase.from('orders').delete().eq('id', order.id);
        return NextResponse.json({ error: 'Mercado Pago no devolvió una URL de pago.' }, { status: 500 });
      }

      return NextResponse.json({ success: true, orderId: order.id, checkoutUrl: prefResponse.init_point });
    }
    // ─────────────────────────────────────────────────────────────────────────

    let trackingNumber = null;
    let trackingUrl = null;
    let paymentStatus = 'pending';
    let orderStatus = 'en proceso';

    // Crear guía INDELI para SPEI/OXXO si aplica
    if (shippingOption && shippingOption.option_id !== "free_shipping" && settings && settings.shipping_api_provider === 'indeli' && settings.shipping_api_key) {
      let sender = { contact: "Remitente", company: "Tienda", email: "contacto@tienda.com", phone: "5555555555", street: "Centro", num_ext: "1", num_int: "", colony: "Centro", city: "CDMX", state: "CDMX", cp: "00000", reference: "" };
      try {
        if (settings.sender_address?.startsWith('{')) {
          const addr = JSON.parse(settings.sender_address);
          sender = { ...sender, phone: addr.phone || sender.phone, street: addr.street || sender.street, colony: addr.city || sender.colony, city: addr.city || sender.city, state: addr.state || sender.state, cp: addr.zip_code || sender.cp };
        }
      } catch(e) {}

      const indeliRes = await fetch("https://indeli-guias-prepagadas.vercel.app/guide/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${settings.shipping_api_key}`, "X-Idempotency-Key": `order-${user?.id || 'anon'}-${Date.now()}` },
        body: JSON.stringify({
          quote_id: shippingOption.quote_id,
          option_id: shippingOption.option_id,
          reference: `ORD-${Date.now()}`,
          sender,
          receiver: { contact: shippingAddress.contact, email: shippingAddress.email, phone: shippingAddress.phone, street: shippingAddress.street, num_ext: shippingAddress.num_ext, num_int: shippingAddress.num_int || "", colony: shippingAddress.colony, city: shippingAddress.city, state: shippingAddress.state, cp: shippingAddress.cp, reference: shippingAddress.reference || "S/N" },
          package: { description: "Compra en tienda online", content: items.map((i: any) => i.name).join(", ") },
          insurance: { enabled: false, declared_value: 0 }
        })
      });

      const indeliData = await indeliRes.json();
      if (!indeliRes.ok) throw new Error(indeliData.error || indeliData.message || "Error al generar la guía en Indeli");
      trackingNumber = indeliData.tracking_number || indeliData.guide?.tracking_number;
      trackingUrl = indeliData.tracking_url || indeliData.guide?.tracking_url;
    }

    const shippingDetails = shippingAddress ? { ...shippingAddress, carrier: shippingOption?.carrier || "N/A", service: shippingOption?.service || "N/A", shipping_cost: shippingCost || 0 } : null;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user?.id || null,
        total_amount: finalTotal,
        status: orderStatus,
        items: items,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        discount_amount: discountAmount || 0,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        shipping_address: shippingDetails ? JSON.stringify(shippingDetails) : null,
        payment_method: paymentMethod || 'spei',
        payment_status: paymentStatus,
      }])
      .select()
      .single();

    if (orderError) throw new Error("No se pudo crear la orden: " + orderError.message);

    if (appliedCoupon?.id) {
      const { data: cData } = await supabase.from('coupons').select('uses_count').eq('id', appliedCoupon.id).single();
      if (cData) await supabase.from('coupons').update({ uses_count: (cData.uses_count || 0) + 1 }).eq('id', appliedCoupon.id);
    }

    for (const item of items) {
      const { data: product } = await supabase.from('products').select('stock, variants').eq('id', item.productId).single();
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - item.quantity);
        const updatePayload: any = { stock: newStock };
        if (item.variantId && product.variants && Array.isArray(product.variants)) {
          updatePayload.variants = product.variants.map((v: any) =>
            v.id === item.variantId ? { ...v, stock: Math.max(0, v.stock - item.quantity) } : v
          );
        }
        await supabase.from('products').update(updatePayload).eq('id', item.productId);
      }
    }

    return NextResponse.json({ success: true, orderId: order?.id, order });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
