import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const TikTokIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" {...props}>
    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
  </svg>
);

export default function Pixels() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pixels, setPixels] = useState({ facebook: '', tiktok: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPixels = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('pixels')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        toast({ title: 'Erreur', description: "Impossible de charger les pixels.", variant: 'destructive' });
      } else if (data && data.pixels) {
        setPixels({
          facebook: data.pixels.facebook || '',
          tiktok: data.pixels.tiktok || '',
        });
      }
      setLoading(false);
    };
    fetchPixels();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from('settings')
      .upsert({ 
        user_id: user.id, 
        pixels: { facebook: pixels.facebook, tiktok: pixels.tiktok } 
      }, { onConflict: 'user_id' });


    setLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: 'La sauvegarde a échoué.', variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Vos pixels ont été enregistrés.' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPixels(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Pixels de Suivi</h1>
        <p className="text-muted-foreground">Intégrez vos pixels marketing pour suivre les conversions et optimiser vos campagnes.</p>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Identifiants des Pixels</CardTitle>
            <CardDescription>
              Entrez les identifiants de vos pixels Facebook et TikTok. Ils seront ajoutés à toutes les pages de vos boutiques.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center">
                <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                <span>Pixel Facebook ID</span>
              </Label>
              <Input
                id="facebook"
                name="facebook"
                placeholder="Ex: 123456789012345"
                value={pixels.facebook}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok" className="flex items-center">
                <TikTokIcon className="w-4 h-4 mr-2" />
                <span>Pixel TikTok ID</span>
              </Label>
              <Input
                id="tiktok"
                name="tiktok"
                placeholder="Ex: C1A2B3D4E5F6G7H8I9"
                value={pixels.tiktok}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}