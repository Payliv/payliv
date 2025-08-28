import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, FileText, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function DigitalAccessPage() {
  const location = useLocation();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('order_id');
    if (orderId) {
      setIdentifier(orderId);
    }
  }, [location.search]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identifier || !email) {
      toast({ title: 'Champs requis', description: 'Veuillez fournir l\'identifiant de commande et votre e-mail.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setSearched(true);
    setProducts([]);

    try {
      const { data, error } = await supabase.functions.invoke('get-digital-products-by-order', {
        body: { identifier, email },
      });

      if (error) throw error;

      if (data.error) {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      } else if (data.products && data.products.length > 0) {
        setProducts(data.products);
        toast({ title: 'Produits trouvés !', description: 'Voici vos liens de téléchargement.' });
      } else {
        toast({ title: 'Aucun produit trouvé', description: 'Vérifiez vos informations ou contactez le support.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur de recherche', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Accès à vos produits digitaux - PayLiv</title>
        <meta name="description" content="Accédez et téléchargez vos produits digitaux achetés via PayLiv en utilisant votre identifiant de commande et votre e-mail." />
      </Helmet>
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Vos Produits Digitaux</CardTitle>
              <CardDescription>Entrez votre identifiant de commande/transaction et votre e-mail pour accéder à vos achats.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="identifier">ID Commande/Transaction</Label>
                  <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="ID de la commande ou transaction" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre adresse e-mail" />
                </div>
                <Button type="submit" disabled={loading} className="w-full sm:col-span-2">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2 h-4 w-4" />}
                  Rechercher mes produits
                </Button>
              </form>
            </CardContent>
            {searched && (
              <CardFooter className="flex flex-col items-start gap-4 pt-6">
                {loading ? (
                  <div className="w-full text-center">
                    <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
                  </div>
                ) : products.length > 0 ? (
                  <div className="w-full space-y-3">
                    {products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-primary" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <Button asChild size="sm">
                          <a href={product.url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="w-full text-center text-muted-foreground">Aucun produit digital trouvé pour ces informations.</p>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}