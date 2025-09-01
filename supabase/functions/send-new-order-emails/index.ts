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
    const { order, store } = await req.json();
    
    if (!order || !store) {
      return new Response(JSON.stringify({ error: 'Missing order or store data' }), {
        status: 400,
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

    // Email to Customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Confirmation de commande</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h1 style="color: #333;">Merci pour votre commande !</h1>
          <p>Votre commande #${order.id.substring(0, 8)} auprès de <strong>${store.name}</strong> a bien été reçue.</p>
          <h3>Détails de la commande :</h3>
          <ul>
            ${order.items.map(item => `<li>${item.name} (x${item.quantity}) - ${item.price} ${order.currency}</li>`).join('')}
          </ul>
          <p><strong>Total : ${order.total} ${order.currency}</strong></p>
          <p>Le vendeur vous contactera bientôt pour la livraison. Si vous avez des questions, veuillez le contacter directement.</p>
          <p>Merci de votre confiance,<br>L'équipe PayLiv</p>
        </div>
      </body>
      </html>
    `;

    // Email to Seller
    const sellerEmailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Nouvelle commande</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h1 style="color: #333;">Nouvelle commande ! 🎉</h1>
          <p>Vous avez une nouvelle commande de <strong>${order.customer.name}</strong>.</p>
          <h3>Détails de la commande #${order.id.substring(0, 8)}:</h3>
          <ul>
            ${order.items.map(item => `<li>${item.name} (x${item.quantity}) - ${item.price} ${order.currency}</li>`).join('')}
          </ul>
          <p><strong>Total : ${order.total} ${order.currency}</strong></p>
          <h3>Informations client :</h3>
          <p>Nom: ${order.customer.name}<br>
          Téléphone: ${order.customer.phone}<br>
          ${order.customer.email ? `Email: ${order.customer.email}<br>` : ''}
          ${order.customer.city ? `Ville: ${order.customer.city}` : ''}</p>
          <p>Connectez-vous à votre tableau de bord pour gérer cette commande.</p>
          <a href="https://payliv.shop/orders" style="display: inline-block; padding: 12px 24px; background-color: #fbbf24; color: #111827; text-decoration: none; border-radius: 6px; font-weight: bold;">Voir la commande</a>
        </div>
      </body>
      </html>
    `;

    // Send email to customer
    if (order.customer.email) {
      try {
        await resend.emails.send({
          from: 'PayLiv <noreply@payliv.shop>',
          to: [order.customer.email],
          subject: `Confirmation de votre commande #${order.id.substring(0, 8)}`,
          html: customerEmailHtml,
        });
      } catch (error) {
        console.error('Error sending customer email:', error);
      }
    }

    // Send email to seller
    if (store.owner_email) {
      try {
        await resend.emails.send({
          from: 'PayLiv <noreply@payliv.shop>',
          to: [store.owner_email],
          subject: `Nouvelle commande sur votre boutique ${store.name}`,
          html: sellerEmailHtml,
        });
      } catch (error) {
        console.error('Error sending seller email:', error);
      }
    }

    return new Response(JSON.stringify({ message: "Emails sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unhandled error in send-new-order-emails:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});