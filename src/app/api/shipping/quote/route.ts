import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { items, destinationZip } = body;

    if (!items || !items.length || !destinationZip) {
      return NextResponse.json({ error: "Faltan items o CP de destino" }, { status: 400 });
    }

    // 1. Get Store Settings
    const { data: settings } = await supabase.from('store_settings').select('*').limit(1).single();
    if (!settings) throw new Error("Configuración de tienda no encontrada");
    
    if (settings.shipping_api_provider !== 'indeli') {
      throw new Error("El proveedor de envíos configurado no es INDELI");
    }

    if (!settings.shipping_api_key) {
      throw new Error("API Key de envíos no configurada");
    }

    let originZip = "00000";
    try {
      if (settings.sender_address.startsWith('{')) {
        const addr = JSON.parse(settings.sender_address);
        originZip = addr.zip_code;
      }
    } catch {
      // Fallback
    }

    if (!originZip || originZip === "00000") {
      throw new Error("El CP de origen no está configurado en el panel");
    }

    // 2. Calculate Total Weight and Max Dimensions
    // Default package size if products don't have dimensions
    let totalWeight = 0;
    let maxL = 10;
    let maxW = 10;
    let maxH = 10;
    
    let paidShippingItemsCount = 0;
    let totalPrice = 0;

    for (const item of items) {
      const { data: product } = await supabase.from('products').select('features, price').eq('id', item.productId).single();
      
      let isFreeShipping = false;
      if (product && product.features && product.features["Envío Gratis"] === "Sí") {
        isFreeShipping = true;
      }

      if (isFreeShipping) {
        if (product && product.price) {
          totalPrice += product.price * item.quantity;
        }
        continue; // Skip this product for Indeli weight/dimensions
      }

      paidShippingItemsCount++;

      if (product) {
        if (product.price) {
          totalPrice += product.price * item.quantity;
        }
        if (product.features) {
        // Parse Peso
        const pesoStr = product.features["Peso"]; // e.g. "1.5 kg"
        let pWeight = 1;
        if (pesoStr) {
          const w = parseFloat(pesoStr);
          if (!isNaN(w)) pWeight = w;
        }
        totalWeight += (pWeight * item.quantity);

        // Parse Medidas de Envío
        const medStr = product.features["Medidas de Envío"]; // e.g. "20cm x 15cm x 10cm"
        if (medStr) {
          const dims = medStr.replace(/cm/g, '').split('x').map(s => parseFloat(s.trim()));
          if (dims.length === 3) {
            maxW = Math.max(maxW, dims[0]);
            maxH = Math.max(maxH, dims[1]);
            maxL = Math.max(maxL, dims[2]);
          }
        }
        } // Close if (product.features)
      } else {
        totalWeight += (1 * item.quantity); // 1kg default
      }
    }

    // Check Global Free Shipping Threshold
    const threshold = settings.free_shipping_threshold ? parseFloat(settings.free_shipping_threshold) : 0;
    const meetsThreshold = threshold > 0 && totalPrice >= threshold;

    if (paidShippingItemsCount === 0 || meetsThreshold) {
      // All items have free shipping! Or the threshold is met.
      return NextResponse.json({
        success: true,
        quote: {
          quote_id: "free_shipping_quote",
          options: [
            {
              option_id: "free_shipping",
              carrier: "ENVÍO GRATIS",
              service: meetsThreshold ? "Envío Gratis por Compra Mínima" : "Estándar",
              price_mxn: 0,
              estimated_days: "3-5"
            }
          ]
        }
      });
    }

    // 3. Call INDELI Quote API
    const indeliUrl = 'https://indeli-guias-prepagadas.vercel.app/quote/create';
    const indeliBody = {
      origin_zip: originZip,
      destination_zip: destinationZip,
      package: {
        length_cm: maxL,
        width_cm: maxW,
        height_cm: maxH,
        weight_kg: totalWeight
      }
    };

    const response = await fetch(indeliUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.shipping_api_key}`
      },
      body: JSON.stringify(indeliBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error al cotizar con INDELI");
    }

    return NextResponse.json({ success: true, quote: data });

  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
