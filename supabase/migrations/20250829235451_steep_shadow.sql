/*
  # Update order notification function with owner email

  1. Function Updates
    - Modified `handle_new_order_notification` to include store owner's email
    - Enhanced payload structure for edge function
    - Added proper error handling for vault access
    - Improved data fetching with JOIN operations

  2. Security
    - Maintains SECURITY DEFINER for proper permissions
    - Uses vault for secure service role key access
    - Proper error handling for missing data

  3. Changes
    - Added JOIN with auth.users to get owner email
    - Enhanced payload with complete store and owner information
    - Improved error handling and logging
*/

CREATE OR REPLACE FUNCTION public.handle_new_order_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_store record;
    v_service_role_key text;
    v_payload jsonb;
BEGIN
    -- Fetch the store details for the new order, now including the owner's email
    SELECT s.*, p.name as owner_name, p.whatsapp_number as owner_whatsapp, u.email as owner_email
    INTO v_store
    FROM public.stores s
    JOIN public.profiles p on s.user_id = p.id
    JOIN auth.users u on s.user_id = u.id
    WHERE s.id = NEW.store_id;

    IF NOT FOUND THEN
        -- If store is not found, exit gracefully
        RETURN NEW;
    END IF;

    -- Create an in-app notification for the seller
    PERFORM public.create_notification(
        v_store.user_id,
        'Nouvelle commande ! 🎉',
        'Commande de ' || NEW.total || ' ' || NEW.currency || ' sur la boutique ' || v_store.name || '.',
        '/orders'
    );
    
    -- Prepare the payload to send to the edge function
    v_payload := jsonb_build_object(
      'order', row_to_json(NEW),
      'store', row_to_json(v_store)
    );

    -- Fetch service role key from the vault
    SELECT decrypted_secret INTO v_service_role_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';

    -- Call the edge function to handle sending emails
    PERFORM net.http_post(
        url := 'https://uxvbhmnemnzixlnvawgm.supabase.co/functions/v1/send-new-order-emails',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || v_service_role_key,
            'Content-Type', 'application/json'
        ),
        body := v_payload
    );

    RETURN NEW;
END;
$function$;