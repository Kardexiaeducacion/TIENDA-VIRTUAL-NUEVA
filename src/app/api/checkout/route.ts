import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { items, totalPrice, shippingCost, finalTotal, discountAmount, appliedCoupon, shippingAddress, shippingOption, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    // 1. Obtener usuario (opcional si está logueado)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Obtener configuraciones de tienda
    const { data: settings } = await supabase.from('store_settings').select('*').limit(1).single();

    let trackingNumber = null;
    let trackingUrl = null;

    // 3. Crear guía de INDELI si se proporcionó shippingOption y no es envío gratis
    if (shippingOption && shippingOption.option_id !== "free_shipping" && settings && settings.shipping_api_provider === 'indeli' && settings.shipping_api_key) {
      let sender = {
        contact: "Remitente Tienda",
        company: "Mi Tienda",
        email: "contacto@mitienda.com",
        phone: "5555555555",
        street: "Centro",
        num_ext: "1",
        num_int: "",
        colony: "Centro",
        city: "CDMX",
        state: "CDMX",
        cp: "00000",
        reference: ""
      };

      try {
        if (settings.sender_address.startsWith('{')) {
          const addr = JSON.parse(settings.sender_address);
          sender = {
            contact: "Remitente",
            company: "Tienda",
            email: "contacto@tienda.com",
            phone: addr.phone || "0000000000",
            street: addr.street || "Centro",
            num_ext: "1", // we don't have this separated in store_settings, assume 1 or parse it
            num_int: "",
            colony: addr.city || "Centro", // fallback
            city: addr.city || "Ciudad",
            state: addr.state || "Estado",
            cp: addr.zip_code || "00000",
            reference: ""
          };
        }
      } catch(e) {}

      const indeliBody = {
        quote_id: shippingOption.quote_id,
        option_id: shippingOption.option_id,
        reference: `ORD-${Date.now()}`,
        sender: sender,
        receiver: {
          contact: shippingAddress.contact,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          num_ext: shippingAddress.num_ext,
          num_int: shippingAddress.num_int || "",
          colony: shippingAddress.colony,
          city: shippingAddress.city,
          state: shippingAddress.state,
          cp: shippingAddress.cp,
          reference: shippingAddress.reference || "S/N"
        },
        package: {
          description: "Compra en tienda online",
          content: items.map((i: any) => i.name).join(", ")
        },
        insurance: {
          enabled: false,
          declared_value: 0
        }
      };

      const indeliRes = await fetch("https://indeli-guias-prepagadas.vercel.app/guide/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${settings.shipping_api_key}`,
          "X-Idempotency-Key": `order-${user?.id || 'anon'}-${Date.now()}`
        },
        body: JSON.stringify(indeliBody)
      });

      const indeliData = await indeliRes.json();
      if (!indeliRes.ok) {
        throw new Error(indeliData.error || indeliData.message || "Error al generar la guía en Indeli");
      }

      trackingNumber = indeliData.tracking_number || indeliData.guide?.tracking_number;
      trackingUrl = indeliData.tracking_url || indeliData.guide?.tracking_url;
    }

    const shippingDetails = shippingAddress ? {
      ...shippingAddress,
      carrier: shippingOption?.carrier || "N/A",
      service: shippingOption?.service || "N/A",
      shipping_cost: shippingCost || 0
    } : null;

    // 4. Crear Orden
    const orderData = {
      user_id: user?.id || null,
      total_amount: finalTotal,
      status: "en proceso",
      items: items,
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      discount_amount: discountAmount || 0,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      shipping_address: shippingDetails ? JSON.stringify(shippingDetails) : null,
      payment_method: paymentMethod || 'spei',
      payment_status: 'pending'
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("No se pudo crear la orden: " + orderError.message);
    }

    // 5. Incrementar usos del cupón si se aplicó
    if (appliedCoupon && appliedCoupon.id) {
      // Obtenemos count actual
      const { data: cData } = await supabase.from('coupons').select('uses_count').eq('id', appliedCoupon.id).single();
      if (cData) {
        await supabase.from('coupons').update({ uses_count: (cData.uses_count || 0) + 1 }).eq('id', appliedCoupon.id);
      }
    }

    // 6. Descontar Stock
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

    return NextResponse.json({ success: true, orderId: order?.id, order });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
