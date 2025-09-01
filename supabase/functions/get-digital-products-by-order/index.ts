import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { identifier, email } = await req.json();

    if (!identifier || !email) {
      return new Response(JSON.stringify({ error: 'Missing identifier or email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find order by ID or transaction ID and customer email
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, items, status, customer')
      .or(`id.eq.${identifier},provider_transaction_id.eq.${identifier}`)
      .eq('customer->>email', email)
      .eq('status', 'paid')
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found or not paid' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get digital products from the order
    const digitalProductIds = order.items
      .filter(item => item.product_type === 'digital')
      .map(item => item.product_id);

    if (digitalProductIds.length === 0) {
      return new Response(JSON.stringify({ error: 'No digital products in this order' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get digital files for these products
    const { data: digitalFiles, error: filesError } = await supabaseAdmin
      .from('digital_product_files')
      .select('product_id, file_name, storage_path')
      .in('product_id', digitalProductIds);

    if (filesError) {
      console.error('Error fetching digital files:', filesError);
      return new Response(JSON.stringify({ error: 'Error fetching digital files' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate signed URLs for download
    const products = [];
    for (const file of digitalFiles) {
      try {
        const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
          .from('digital_products')
          .createSignedUrl(file.storage_path, 3600 * 24 * 7); // 7 days validity

        if (urlError) {
          console.error(`Error creating signed URL for ${file.storage_path}:`, urlError);
          continue;
        }

        products.push({
          name: file.file_name,
          url: signedUrlData.signedUrl,
        });
      } catch (error) {
        console.error(`Error processing file ${file.storage_path}:`, error);
      }
    }

    return new Response(JSON.stringify({ products }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-digital-products-by-order:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});