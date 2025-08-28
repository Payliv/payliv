import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';

export default function SuperAdminEmails() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecipients = async () => {
      setLoading(true);
      let query;
      switch (targetAudience) {
        case 'all':
          query = supabase.rpc('get_all_users_with_email');
          break;
        case 'active_subscribers':
          query = supabase.rpc('get_active_subscribers');
          break;
        case 'trial_users':
          query = supabase.rpc('get_trial_users');
          break;
        case 'expired_users':
          query = supabase.rpc('get_users_without_subscription');
          break;
        default:
          query = supabase.rpc('get_all_users_with_email');
      }

      const { data, error } = await query;
      if (error) {
        toast({ title: 'Erreur', description: 'Impossible de charger les destinataires.', variant: 'destructive' });
      } else {
        setRecipients(data.map(user => user.email));
      }
      setLoading(false);
    };

    fetchRecipients();
  }, [targetAudience, toast]);

  const handleSendCampaign = async () => {
    if (!subject || !content || recipients.length === 0) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs et sélectionner une audience.', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-campaign-email', {
        body: {
          recipients,
          subject,
          htmlContent: content,
        },
      });

      if (error) throw error;

      toast({ title: 'Succès', description: `Campagne envoyée à ${recipients.length} destinataires.` });
      setSubject('');
      setContent('');
    } catch (error) {
      toast({ title: 'Erreur', description: `Échec de l'envoi de la campagne: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Gestion des E-mails - Super Admin</title>
      </Helmet>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Envoyer une Campagne d'E-mails</CardTitle>
            <CardDescription>Composez et envoyez des e-mails à des segments spécifiques d'utilisateurs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="audience">Audience Cible</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger id="audience">
                  <SelectValue placeholder="Sélectionner une audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  <SelectItem value="active_subscribers">Abonnés actifs</SelectItem>
                  <SelectItem value="trial_users">Utilisateurs en essai</SelectItem>
                  <SelectItem value="expired_users">Utilisateurs expirés/inactifs</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : `${recipients.length} destinataires trouvés.`}
              </p>
            </div>
            <div>
              <Label htmlFor="subject">Sujet</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Sujet de votre e-mail" />
            </div>
            <div>
              <Label htmlFor="content">Contenu (HTML)</Label>
              <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="<p>Votre contenu HTML ici...</p>" rows={15} />
            </div>
            <Button onClick={handleSendCampaign} disabled={isSending || loading}>
              {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Envoyer la campagne
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}