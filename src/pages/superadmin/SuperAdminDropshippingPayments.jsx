import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle } from 'lucide-react';

const SuperAdminDropshippingPayments = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dropshipping_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la récupération des candidatures',
        description: error.message,
      });
    } else {
      setApplications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreatePartner = (application) => {
    toast({
      title: 'Fonctionnalité en cours de développement',
      description: `La création du profil partenaire pour ${application.company_name || application.name} sera bientôt disponible.`,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Payé</Badge>;
      case 'processed':
        return <Badge variant="outline">Traité</Badge>;
      case 'pending_payment':
      default:
        return <Badge variant="secondary">En attente de paiement</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Paiements Partenaires Dropshipping - Super Admin</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Paiements Partenaires Dropshipping</h1>
            <p className="text-muted-foreground">Gérez les candidatures et les paiements des partenaires dropshipping.</p>
          </div>
          <Button onClick={fetchApplications} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Actualiser
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Candidatures Récentes</CardTitle>
            <CardDescription>
              Liste de tous les fournisseurs ayant soumis une demande de partenariat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Date de candidature</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>{app.company_name || 'N/A'}</TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell className="text-right">
                          {app.status === 'paid' && (
                            <Button size="sm" onClick={() => handleCreatePartner(app)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Créer le profil
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan="6" className="text-center h-24">
                        Aucune candidature pour le moment.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default SuperAdminDropshippingPayments;