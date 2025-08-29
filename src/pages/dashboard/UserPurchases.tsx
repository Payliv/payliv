import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const UserPurchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('customer_digital_products')
          .select(`
            *,
            products:product_id (name, description, image),
            orders:order_id (created_at)
          `)
          .eq('customer_id', user.id);

        if (error) throw error;
        setPurchases(data || []);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  const handleDownload = async (productId: string) => {
    try {
        const { data, error } = await supabase
            .from('digital_product_files')
            .select('storage_path')
            .eq('product_id', productId)
            .single();

        if (error || !data) throw new Error("Fichier non trouvé.");

        const { data: downloadData, error: downloadError } = await supabase
            .storage
            .from('digital-products')
            .download(data.storage_path);

        if (downloadError) throw downloadError;

        const url = URL.createObjectURL(downloadData);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.storage_path.split('/').pop() || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error: any) {
        console.error("Download error:", error);
        alert("Erreur lors du téléchargement du fichier.");
    }
  };

  if (loading) {
    return <div>Chargement de vos achats...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mes Achats</h1>
      {purchases.length === 0 ? (
        <Alert>
          <AlertTitle>Aucun achat</AlertTitle>
          <AlertDescription>
            Vous n'avez encore acheté aucun produit digital.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <CardTitle>{purchase.products.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={purchase.products.image} alt={purchase.products.name} className="w-full h-48 object-cover mb-4 rounded" />
                <p>Acheté le: {new Date(purchase.orders.created_at).toLocaleDateString()}</p>
                <Button className="w-full mt-4" onClick={() => handleDownload(purchase.product_id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPurchases;