import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const webhookData = await req.json();
    
    // Log the webhook for debugging
    await supabase.from('webhook_logs').insert({
      provider: 'money_fusion',
      payload: webhookData,
      status: 'received',
      related_order_id: webhookData.personal_Info?.[0]?.orderId
    });

    const {
      event,
      personal_Info,
      tokenPay,
      numeroTransaction,
      Montant,
      frais,
      statut
    } = webhookData;

    // Extract order information
    const orderInfo = personal_Info?.[0];
    if (!orderInfo?.orderId) {
      console.warn("No order ID found in webhook data");
      return new Response("No order ID", { status: 400, headers: corsHeaders });
    }

    const orderId = orderInfo.orderId;

    // Get current order status to avoid duplicate processing
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status, provider_transaction_id')
      .eq('id', orderId)
      .single();

    if (fetchError) {
      console.error("Error fetching order:", fetchError);
      return new Response("Order not found", { status: 404, headers: corsHeaders });
    }

    // Check if this transaction is already processed
    if (currentOrder.provider_transaction_id === tokenPay && 
        (currentOrder.status === 'paid' || currentOrder.status === 'delivered')) {
      console.log("Transaction already processed, ignoring duplicate webhook");
      return new Response("Already processed", { status: 200, headers: corsHeaders });
    }

    // Process based on event type and status
    let newOrderStatus = currentOrder.status;
    let shouldFinalize = false;

    switch (event) {
      case 'payin.session.pending':
        // Payment initiated, keep current status unless it's unpaid
        if (currentOrder.status === 'unpaid') {
          newOrderStatus = 'pending';
        }
        break;
        
      case 'payin.session.completed':
        if (statut === 'paid') {
          newOrderStatus = 'paid';
          shouldFinalize = true;
        }
        break;
        
      case 'payin.session.cancelled':
        newOrderStatus = 'cancelled';
        break;
        
      default:
        console.log(`Unknown event type: ${event}`);
    }

    // Update order status if changed
    if (newOrderStatus !== currentOrder.status) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: newOrderStatus,
          provider_transaction_id: tokenPay,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
        throw updateError;
      }
    }

    // Finalize payment if completed
    if (shouldFinalize) {
      const { error: finalizeError } = await supabase.rpc('finalize_order_payment', {
        p_order_id: orderId,
        p_provider_tx_id: tokenPay,
        p_payment_provider: 'money_fusion'
      });

      if (finalizeError) {
        console.error("Error finalizing payment:", finalizeError);
        throw finalizeError;
      }
    }

    // Update webhook log status
    await supabase.from('webhook_logs').insert({
      provider: 'money_fusion',
      payload: webhookData,
      status: 'processed',
      related_order_id: orderId
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook processed successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Money Fusion webhook error:", error);
    
    // Log error
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      await supabase.from('webhook_logs').insert({
        provider: 'money_fusion',
        payload: await req.json().catch(() => ({})),
        status: 'error',
        error_message: error.message
      });
    } catch (logError) {
      console.error("Failed to log webhook error:", logError);
    }

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