import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      totalPrice,
      article,
      personal_Info,
      numeroSend,
      nomclient,
      return_url,
      webhook_url
    } = await req.json();

    // Validate required fields
    if (!totalPrice || !article || !numeroSend || !nomclient) {
      return new Response(
        JSON.stringify({ 
          error: "Champs requis manquants: totalPrice, article, numeroSend, nomclient" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare payment data for Money Fusion API
    const paymentData = {
      totalPrice,
      article,
      personal_Info: personal_Info || [],
      numeroSend: numeroSend.replace(/[^0-9]/g, ''), // Clean phone number
      nomclient,
      return_url: return_url || `${new URL(req.url).origin}/payment-status`,
      webhook_url: webhook_url || `${new URL(req.url).origin}/api/webhooks/money-fusion`
    };

    // Call Money Fusion API
    const apiResponse = await fetch("https://www.pay.moneyfusion.net/GS_Money/b625a15aac1daeac/pay/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!apiResponse.ok) {
      throw new Error(`API Money Fusion error: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const responseData = await apiResponse.json();

    // Validate response structure
    if (!responseData.statut) {
      return new Response(
        JSON.stringify({ 
          error: responseData.message || "Erreur lors de l'initialisation du paiement" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        token: responseData.token,
        url: responseData.url,
        message: responseData.message || "Paiement initié avec succès"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Money Fusion payment error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erreur interne du serveur" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});