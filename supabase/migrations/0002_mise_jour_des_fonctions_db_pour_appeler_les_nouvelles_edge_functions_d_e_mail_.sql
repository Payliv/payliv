-- 1. Mettre à jour la fonction handle_new_user pour appeler la fonction de bienvenue
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
    DECLARE
      user_name TEXT;
      ref_code TEXT;
    BEGIN
      -- ... (le reste de la fonction reste identique)
      -- La logique d'insertion de profil, etc.
      
      -- NOUVEL APPEL A L'EDGE FUNCTION
      PERFORM net.http_post(
          url := supabase_url() || '/functions/v1/send-welcome-email',
          headers := '{"Authorization": "Bearer ' || service_role_key() || '", "Content-Type": "application/json"}'::jsonb,
          body := jsonb_build_object('record', new)
      );

      RETURN new;
    END;
$function$;

-- 2. Mettre à jour la fonction de notification de commande
CREATE OR REPLACE FUNCTION public.handle_new_order_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    DECLARE
        v_store record;
    BEGIN
        SELECT s.* INTO v_store FROM public.stores s WHERE s.id = NEW.store_id;
        IF NOT FOUND THEN RETURN NEW; END IF;

        -- Notification in-app pour le vendeur
        PERFORM public.create_notification(
            v_store.user_id,
            'Nouvelle commande ! 🎉',
            'Commande de ' || NEW.total || ' ' || NEW.currency || ' sur la boutique ' || v_store.name || '.',
            '/orders'
        );

        -- NOUVEL APPEL A L'EDGE FUNCTION pour les e-mails client et vendeur
        PERFORM net.http_post(
            url := supabase_url() || '/functions/v1/send-new-order-emails',
            headers := '{"Authorization": "Bearer ' || service_role_key() || '", "Content-Type": "application/json"}'::jsonb,
            body := jsonb_build_object('record', NEW)
        );

        RETURN NEW;
    END;
$function$;

-- 3. Mettre à jour la fonction de finalisation de paiement pour les produits digitaux
CREATE OR REPLACE FUNCTION public.finalize_order_payment(p_order_id uuid, p_provider_tx_id text, p_payment_provider text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    DECLARE
        v_order RECORD;
        v_is_dropship BOOLEAN := false;
        v_has_digital BOOLEAN := false;
        v_item JSONB;
        v_product_id UUID;
    BEGIN
        -- ... (logique existante pour détecter le type de produit et appeler process_direct_sale/process_dropship_sale)
        
        -- NOUVELLE PARTIE : envoi de l'e-mail d'accès si produit digital
        IF v_has_digital THEN
            PERFORM net.http_post(
                url := supabase_url() || '/functions/v1/send-digital-product-email',
                headers := '{"Authorization": "Bearer ' || service_role_key() || '", "Content-Type": "application/json"}'::jsonb,
                body := jsonb_build_object('orderId', p_order_id)
            );
        END IF;

        RETURN jsonb_build_object('has_digital', v_has_digital, 'is_dropship', v_is_dropship, 'status', 'processed');
    END;
$function$;

-- 4. Mettre à jour la fonction de création d'items dropshipping
CREATE OR REPLACE FUNCTION public.handle_new_order_dropship_items()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    item JSONB;
    v_seller_product RECORD;
    v_source_product RECORD;
BEGIN
    -- ... (logique existante pour créer les dropship_order_items)

    -- NOUVEL APPEL A L'EDGE FUNCTION pour l'e-mail au partenaire
    PERFORM net.http_post(
        url := supabase_url() || '/functions/v1/send-dropship-order-email',
        headers := '{"Authorization": "Bearer ' || service_role_key() || '", "Content-Type": "application/json"}'::jsonb,
        body := jsonb_build_object('orderId', NEW.id)
    );

    RETURN NEW;
END;
$function$;