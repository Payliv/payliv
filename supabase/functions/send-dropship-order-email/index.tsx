import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import React from 'https://esm.sh/react@18.2.0';
import ReactDOMServer from 'https://esm.sh/react-dom@18.2.0/server';
import { NewDropshipOrderToPartnerEmail } from './_shared/NewDropshipOrderToPartnerEmail.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

    try {
        const { orderId } = await req.json();
        const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

        const { data: order, error: orderError } = await supabaseAdmin.from('orders').select('id, customer, store_id').eq('id', orderId).single();
        if (orderError) throw orderError;

        const { data: items, error: itemsError } = await supabaseAdmin.from('dropship_order_items').select('quantity, supplier_id, seller_product:seller_product_id(name)').eq('order_id', orderId);
        if (itemsError) throw itemsError;
        if (!items || items.length === 0) return new Response(JSON.stringify({ message: "No dropship items" }));

        const supplierId = items[0].supplier_id;
        const { data: supplier, error: supplierError } = await supabaseAdmin.from('users').select('email').eq('id', supplierId).single();
        if (supplierError) throw supplierError;

        const { data: sellerStore, error: storeError } = await supabaseAdmin.from('stores').select('name').eq('id', order.store_id).single();
        if (storeError) throw storeError;

        const emailHtml = ReactDOMServer.renderToString(
            <NewDropshipOrderToPartnerEmail orderId={order.id} sellerStoreName={sellerStore.name} customer={order.customer} items={items} partnerOrdersUrl="https://payliv.shop/partner/orders" />
        );

        await supabaseAdmin.functions.invoke('send-transactional-email', {
            body: { to: supplier.email, subject: 'Nouvelle commande dropshipping à traiter', html: emailHtml }
        });

        return new Response(JSON.stringify({ message: "Email sent" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
});