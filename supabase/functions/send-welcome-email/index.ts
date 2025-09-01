import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.4.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, dashboardUrl } = await req.json();

    if (!to || !name || !dashboardUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, name, dashboardUrl' }), {
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

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur PayLiv !</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
          body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Inter', Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.05); overflow: hidden;">
                <!-- Logo Header -->
                <tr>
                  <td align="center" style="padding: 30px 20px; background-color: #111827;">
                    <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/feb1d3e1435a3634d6141f996db8251a.png" alt="PayLiv Logo" style="width: 120px; height: auto;">
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 20px 0;">Bienvenue sur PayLiv, ${name} !</h1>
                    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
                      Nous sommes ravis de vous compter parmi nous. PayLiv est la plateforme tout-en-un pour lancer et faire grandir votre business en ligne en Afrique.
                    </p>
                    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 30px 0;">
                      Que vous souhaitiez vendre vos propres produits, faire du dropshipping ou explorer notre marketplace, nous avons les outils qu'il vous faut.
                    </p>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: #111827; background-color: #fbbf24; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);">
                            Accéder à mon tableau de bord
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 30px 0 20px 0;">
                      Si vous avez des questions, n'hésitez pas à consulter notre centre d'aide ou à nous contacter.
                    </p>
                    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0;">
                      À très bientôt,<br>L'équipe PayLiv
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 20px 30px; background-color: #f1f5f9; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 12px; color: #6b7280; margin: 0;">
                      Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:support@payliv.shop" style="color: #4f46e5; text-decoration: none;">support@payliv.shop</a>.
                    </p>
                    <p style="font-size: 12px; color: #6b7280; margin: 10px 0 0 0;">
                      © 2025 PayLiv. Tous droits réservés.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'PayLiv <noreply@payliv.shop>',
      to: [to],
      subject: 'Bienvenue sur PayLiv ! Votre aventure e-commerce commence ici 🎉',
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Welcome email sent successfully', data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unhandled error in send-welcome-email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});