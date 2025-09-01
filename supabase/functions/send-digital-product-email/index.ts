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

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, customer')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resend = new Resend(resendApiKey);

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Vos produits sont prêts !</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h1 style="color: #333;">Vos produits sont prêts !</h1>
          <p>Bonjour ${order.customer.name},</p>
          <p>Merci pour votre achat. Vos produits digitaux pour la commande #${order.id.substring(0, 8)} sont maintenant disponibles.</p>
          <p>Vous pouvez les télécharger à tout moment depuis votre espace personnel.</p>
          <a href="https://payliv.shop/my-purchases" style="display: inline-block; padding: 12px 24px; background-color: #fbbf24; color: #111827; text-decoration: none; border-radius: 6px; font-weight: bold;">Accéder à mes achats</a>
          <p style="margin-top: 20px;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <p>Merci de votre confiance,<br>L'équipe PayLiv</p>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: 'PayLiv <noreply@payliv.shop>',
      to: [order.customer.email],
      subject: 'Vos produits digitaux sont prêts !',
      html: emailHtml,
    });

    return new Response(JSON.stringify({ message: "Digital product email sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-digital-product-email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});