import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import React from 'https://esm.sh/react@18.2.0';
import ReactDOMServer from 'https://esm.sh/react-dom@18.2.0/server';
import { DigitalProductAccessEmail } from './_shared/DigitalProductAccessEmail.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }); }

    try {
        const { orderId } = await req.json();
        const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

        const { data: order, error } = await supabaseAdmin.from('orders').select('id, customer').eq('id', orderId).single();
        if (error) throw error;

        const emailHtml = ReactDOMServer.renderToString(
            <DigitalProductAccessEmail customerName={order.customer.name} orderId={order.id} purchasesUrl="https://payliv.shop/my-purchases" />
        );

        await supabaseAdmin.functions.invoke('send-transactional-email', {
            body: { to: order.customer.email, subject: 'Vos produits digitaux sont prêts !', html: emailHtml }
        });

        return new Response(JSON.stringify({ message: "Email sent" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
});