import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.4.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, customer, store_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get dropship items for this order
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('dropship_order_items')
      .select(`
        quantity,
        supplier_id,
        seller_product:seller_product_id(name)
      `)
      .eq('order_id', orderId);

    if (itemsError || !items || items.length === 0) {
      return new Response(JSON.stringify({ message: "No dropship items found" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get supplier email
    const supplierId = items[0].supplier_id;
    const { data: supplier, error: supplierError } = await supabaseAdmin
      .from('profiles')
      .select('name, whatsapp_number')
      .eq('id', supplierId)
      .single();

    if (supplierError) {
      console.error('Error fetching supplier:', supplierError);
      return new Response(JSON.stringify({ error: 'Supplier not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: supplierUser, error: supplierUserError } = await supabaseAdmin
      .from('auth.users')
      .select('email')
      .eq('id', supplierId)
      .single();

    if (supplierUserError) {
      console.error('Error fetching supplier user:', supplierUserError);
      return new Response(JSON.stringify({ error: 'Supplier user not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get seller store name
    const { data: sellerStore, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('name')
      .eq('id', order.store_id)
      .single();

    if (storeError) {
      console.error('Error fetching seller store:', storeError);
      return new Response(JSON.stringify({ error: 'Store not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resend = new Resend(resendApiKey);

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Nouvelle commande dropshipping</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h1 style="color: #333;">Nouvelle commande dropshipping à traiter !</h1>
          <p>La boutique <strong>${sellerStore.name}</strong> a vendu un ou plusieurs de vos produits.</p>
          <h3>Détails de la commande #${order.id.substring(0, 8)}:</h3>
          <ul>
            ${items.map(item => `<li>Produit: ${item.seller_product.name} (x${item.quantity})</li>`).join('')}
          </ul>
          <h3>Informations de livraison :</h3>
          <p>Client: ${order.customer.name}<br>
          Téléphone: ${order.customer.phone}<br>
          ${order.customer.city ? `Ville: ${order.customer.city}<br>` : ''}
          ${order.customer.address ? `Adresse: ${order.customer.address}` : ''}</p>
          <p>Veuillez préparer et expédier la commande dès que possible.</p>
          <a href="https://payliv.shop/partner/orders" style="display: inline-block; padding: 12px 24px; background-color: #fbbf24; color: #111827; text-decoration: none; border-radius: 6px; font-weight: bold;">Gérer mes commandes dropshipping</a>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: 'PayLiv <noreply@payliv.shop>',
      to: [supplierUser.email],
      subject: 'Nouvelle commande dropshipping à traiter',
      html: emailHtml,
    });

    return new Response(JSON.stringify({ message: "Dropship order email sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-dropship-order-email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});