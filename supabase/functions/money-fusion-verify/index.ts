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
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token de paiement requis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call Money Fusion verification API
    const verifyResponse = await fetch(
      `https://www.pay.moneyfusion.net/paiementNotif/${token}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Read response as text first to handle potential HTML error pages
    const responseText = await verifyResponse.text();

    if (!verifyResponse.ok) {
      throw new Error(`Verification API error: ${verifyResponse.status} ${verifyResponse.statusText}. Response: ${responseText}`);
    }

    // Try to parse as JSON, handle cases where response is HTML
    let verificationData;
    try {
      verificationData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", responseText);
      throw new Error(`Invalid JSON response from Money Fusion API. Received: ${responseText.substring(0, 200)}...`);
    }

    // Return the verification data
    return new Response(
      JSON.stringify({
        success: true,
        statut: verificationData.statut,
        data: verificationData.data,
        message: verificationData.message || "Vérification réussie"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Money Fusion verification error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erreur lors de la vérification du paiement" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});