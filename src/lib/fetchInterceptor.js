import { toast } from '@/components/ui/use-toast';

    let isNetworkErrorToastVisible = false;
    let toastId = null;

    export const setupFetchInterceptor = () => {
      const originalFetch = window.fetch;

      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);
          
          if (isNetworkErrorToastVisible) {
            isNetworkErrorToastVisible = false;
          }

          return response;
        } catch (error) {
          if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('NetworkError'))) {
            console.error('Network error detected by fetch interceptor:', args[0]);
            
            window.dispatchEvent(new CustomEvent('network-error', { detail: { error } }));

            if (!isNetworkErrorToastVisible) {
              isNetworkErrorToastVisible = true;
              const { id } = toast({
                title: 'Erreur de Réseau',
                description: "Connexion impossible. Vérifiez votre internet et vos extensions de navigateur (bloqueurs de pub).",
                variant: 'destructive',
                duration: 15000,
              });
              toastId = id;
              
              setTimeout(() => {
                if (toastId === id) {
                  isNetworkErrorToastVisible = false;
                }
              }, 15000);
            }
          }
          
          throw error;
        }
      };
    };