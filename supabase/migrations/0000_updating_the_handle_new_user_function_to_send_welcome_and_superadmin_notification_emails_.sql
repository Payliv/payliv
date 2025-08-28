CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
    DECLARE
      user_name TEXT;
      ref_code TEXT;
      v_new_store_id uuid;
      v_store_slug TEXT;
      v_dashboard_url TEXT := 'https://payliv.shop/dashboard'; -- Base URL for dashboard
    BEGIN
      BEGIN
        user_name := new.raw_user_meta_data->>'name';
        ref_code := new.raw_user_meta_data->>'ref_code';
      EXCEPTION WHEN others THEN
        user_name := NULL;
        ref_code := NULL;
      END;

      IF lower(new.email) = 'contact@gstartup.pro' THEN
        INSERT INTO public.profiles (id, name, role)
        VALUES (new.id, user_name, 'superadmin');
      ELSE
        INSERT INTO public.profiles (id, name, role, affiliate_ref_code, trial_ends_at, getting_started_checklist)
        VALUES (new.id, user_name, 'user', ref_code, now() + interval '3 days', '{"store_created": true, "product_added": false, "payment_setup": false}');
        
        INSERT INTO public.settings (user_id, general, payments, notifications)
        VALUES (
          new.id,
          '{"companyName": "", "email": "", "phone": "", "address": "", "website": "", "nif": "", "rccm": "", "tax_id": ""}',
          '{"cashOnDelivery": true, "currency": "XOF", "apiweb_enabled": true, "tax_rate": 18}',
          '{"emailNotifications": true, "orderAlerts": true, "orderRecipientEmail": "", "marketingEmails": false}'
        );
        
        v_store_slug := public.generate_unique_store_slug(COALESCE(user_name, 'Ma Boutique'));

        INSERT INTO public.stores (user_id, name, slug, status, store_type, theme, settings, description)
        VALUES (
            new.id,
            COALESCE(user_name, 'Ma Boutique'),
            v_store_slug,
            'draft',
            'digital',
            '{ "primaryColor": "#FBBF24", "secondaryColor": "#10B981", "font": "Inter", "backgroundColor": "#FFFFFF", "textColor": "#111827", "textColorOnPrimary": "#FFFFFF" }',
            '{ "metaTitle": "", "metaDescription": "", "currency": "XOF", "payments": {"apiweb_enabled": true, "cinetpay_enabled": true, "paydunya_enabled": true, "cashOnDelivery": false} }',
            'Bienvenue dans ma nouvelle boutique !'
        ) RETURNING id INTO v_new_store_id;

        -- Send welcome email to new user
        BEGIN
            PERFORM net.http_post(
                url := supabase_url() || '/functions/v1/send-welcome-email',
                headers := '{"Authorization": "Bearer ' || service_role_key() || '", "Content-Type": "application/json"}'::jsonb,
                body := jsonb_build_object(
                    'to', new.email,
                    'name', COALESCE(user_name, 'Cher utilisateur'),
                    'dashboardUrl', v_dashboard_url
                )
            );
        EXCEPTION WHEN others THEN
            RAISE WARNING 'Failed to send welcome email to new user %: %', new.email, SQLERRM;
        END;
      END IF;

      -- Send notification email to superadmin for ALL new sign-ups
      BEGIN
          PERFORM net.http_post(
              url := supabase_url() || '/functions/v1/send-transactional-email',
              headers := '{"Authorization": "Bearer ' || service_role_key() || '", "Content-Type": "application/json"}'::jsonb,
              body := jsonb_build_object(
                  'to', 'contact@gstartup.pro',
                  'subject', 'Nouvelle inscription sur PayLiv !',
                  'html', '<h1>Nouvel utilisateur inscrit</h1><p>Un nouvel utilisateur s''est inscrit sur PayLiv.</p><ul><li><strong>Nom:</strong> ' || COALESCE(user_name, 'N/A') || '</li><li><strong>Email:</strong> ' || new.email || '</li><li><strong>Rôle:</strong> ' || (CASE WHEN lower(new.email) = 'contact@gstartup.pro' THEN 'Super Admin' ELSE 'Utilisateur' END) || '</li></ul><p>Veuillez vérifier le tableau de bord administrateur pour plus de détails.</p>'
              )
          );
      EXCEPTION WHEN others THEN
          RAISE WARNING 'Failed to send superadmin notification email for new user %: %', new.email, SQLERRM;
      END;

      RETURN new;
    END;
$$;