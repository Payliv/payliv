import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import React from 'https://esm.sh/react@18.2.0';
import ReactDOMServer from 'https://esm.sh/react-dom@18.2.0/server';
import { WelcomeEmail } from './_shared/WelcomeEmail.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record: user } = await req.json();
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const emailHtml = ReactDOMServer.renderToString(
      <WelcomeEmail name={user.raw_user_meta_data.name || 'Cher utilisateur'} dashboardUrl="https://payliv.shop/dashboard" />
    );

    await supabaseAdmin.functions.invoke('send-transactional-email', {
        body: {
            to: user.email,
            subject: 'Bienvenue sur PayLiv !',
            html: emailHtml
        }
    });

    return new Response(JSON.stringify({ message: "Email sent" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});