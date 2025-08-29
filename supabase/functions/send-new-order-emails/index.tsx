import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import React from 'https://esm.sh/react@18.2.0';
import ReactDOMServer from 'https://esm.sh/react-dom@18.2.0/server';
import { NewOrderToCustomerEmail } from './_shared/NewOrderToCustomerEmail.tsx';
import { NewOrderToSellerEmail } from './_shared/NewOrderToSellerEmail.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

    try {
        const { record: order } = await req.json();
        const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

        const { data: store, error: storeError } = await supabaseAdmin.from('stores').select('name, user_id').eq('id', order.store_id).single();
        if (storeError) throw storeError;

        const { data: seller, error: sellerError } = await supabaseAdmin.from('users').select('email').eq('id', store.user_id).single();
        if (sellerError) throw sellerError;

        // Send to Customer
        const customerEmailHtml = ReactDOMServer.renderToString(
            <NewOrderToCustomerEmail orderId={order.id} storeName={store.name} items={order.items} total={order.total} currency={order.currency} />
        );
        await supabaseAdmin.functions.invoke('send-transactional-email', {
            body: { to: order.customer.email, subject: `Confirmation de votre commande #${order.id.substring(0, 8)}`, html: customerEmailHtml }
        });

        // Send to Seller
        const sellerEmailHtml = ReactDOMServer.renderToString(
            <NewOrderToSellerEmail orderId={order.id} customerName={order.customer.name} items={order.items} total={order.total} currency={order.currency} orderUrl={`https://payliv.shop/orders`} />
        );
        await supabaseAdmin.functions.invoke('send-transactional-email', {
            body: { to: seller.email, subject: `Nouvelle commande sur votre boutique ${store.name}`, html: sellerEmailHtml }
        });

        return new Response(JSON.stringify({ message: "Emails sent" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
});