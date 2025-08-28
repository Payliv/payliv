import React, { useState, useEffect } from 'react';
    import { useParams, Link } from 'react-router-dom';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import PageLoader from '@/components/PageLoader';
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
    import { Download, ArrowLeft, FileText, AlertTriangle, ShoppingCart, Hash, Calendar, Store as StoreIcon } from 'lucide-react';
    import { Badge } from '@/components/ui/badge';
    import { getStatusColor, getStatusLabel } from '@/lib/utils';
    import { Separator } from '@/components/ui/separator';

    const DigitalOrderDetailsPage = () => {
      const { orderId } = useParams();
      const { user } = useAuth();
      const { toast } = useToast();

      const [order, setOrder] = useState(null);
      const [digitalProducts, setDigitalProducts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      const getCurrencySymbol = (currency) => currency === 'XOF' ? 'FCFA' : (currency || '€');

      useEffect(() => {
        const fetchOrderDetails = async () => {
          if (!user || !orderId) {
            setLoading(false);
            setError("Informations utilisateur ou commande manquantes.");
            return;
          }

          setLoading(true);
          setError(null);

          try {
            const { data: orderData, error: orderError } = await supabase
              .from('orders')
              .select('*, store:store_id(name)')
              .eq('id', orderId)
              .eq('customer->>email', user.email)
              .single();

            if (orderError || !orderData) {
              throw new Error("Commande non trouvée ou vous n'avez pas la permission de la voir.");
            }
            setOrder(orderData);

            const productIds = orderData.items.map(item => item.product_id);
            const { data: productsData, error: productsError } = await supabase
              .from('products')
              .select('id, name, product_type')
              .in('id', productIds);
            
            if (productsError) throw productsError;

            const digitalProductIds = productsData
              .filter(p => p.product_type === 'digital')
              .map(p => p.id);

            if (digitalProductIds.length > 0) {
              const { data: filesData, error: filesError } = await supabase
                .from('digital_product_files')
                .select('product_id, file_name, storage_path')
                .in('product_id', digitalProductIds);
              
              if (filesError) throw filesError;

              const downloadLinksPromises = filesData.map(async (file) => {
                const { data, error } = await supabase.storage
                  .from('digital_products')
                  .createSignedUrl(file.storage_path, 3600 * 24 * 7); // 7 days validity
                
                if (error) {
                  console.error(`Error creating signed URL for ${file.storage_path}:`, error);
                  return null;
                }
                const productInfo = productsData.find(p => p.id === file.product_id);
                return {
                  productId: file.product_id,
                  name: productInfo?.name || file.file_name,
                  url: data.signedUrl,
                };
              });
              const downloadLinks = (await Promise.all(downloadLinksPromises)).filter(Boolean);
              setDigitalProducts(downloadLinks);
            }

          } catch (err) {
            setError(err.message);
            toast({
              title: 'Erreur',
              description: err.message,
              variant: 'destructive',
            });
          } finally {
            setLoading(false);
          }
        };

        fetchOrderDetails();
      }, [orderId, user, toast]);

      if (loading) return <PageLoader />;

      return (
        <>
          <Helmet>
            <title>Détails de la commande #{orderId?.substring(0,8)} - PayLiv</title>
          </Helmet>
          <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <Button variant="outline" asChild className="mb-6">
                <Link to="/my-purchases">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à Mes Achats
                </Link>
              </Button>
              {error ? (
                 <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50 p-6">
                    <CardTitle className="text-2xl flex items-center justify-between">
                      <span>Commande #{orderId.substring(0, 8)}</span>
                      <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                       <div className="flex items-center gap-1.5"><StoreIcon className="h-4 w-4"/><span>{order?.store?.name}</span></div>
                       <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/><span>{new Date(order?.created_at).toLocaleDateString('fr-FR')}</span></div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Articles de la commande</h3>
                    <ul className="space-y-3">
                      {order?.items.map((item) => {
                        const digitalFile = digitalProducts.find(p => p.productId === item.product_id);
                        return (
                          <li key={item.product_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex-grow">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.quantity} x {item.price.toLocaleString()} {getCurrencySymbol(order.currency)}</p>
                            </div>
                            {digitalFile && (
                              <Button asChild size="sm" className="mt-2 sm:mt-0">
                                <a href={digitalFile.url} target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" />
                                  Télécharger
                                </a>
                              </Button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    {digitalProducts.length > 0 && <p className="text-xs text-muted-foreground pt-4 text-center">Les liens de téléchargement sont valides pendant 7 jours.</p>}
                     {digitalProducts.length === 0 && (
                        <Alert className="mt-6">
                            <ShoppingCart className="h-4 w-4" />
                            <AlertTitle>Aucun produit digital</AlertTitle>
                            <AlertDescription>Cette commande ne contient aucun produit digital à télécharger.</AlertDescription>
                        </Alert>
                     )}
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-6">
                    <div className="w-full flex justify-end">
                        <div className="text-right">
                            <p className="text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">{order.total.toLocaleString()} {getCurrencySymbol(order.currency)}</p>
                        </div>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </motion.div>
          </div>
        </>
      );
    };

    export default DigitalOrderDetailsPage;