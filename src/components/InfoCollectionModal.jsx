import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const InfoCollectionModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const { profile } = useProfile();
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setWhatsapp(profile.whatsapp_number || '');
        }
    }, [profile, isOpen]);

    const handleSave = async () => {
        if (!name || !whatsapp) {
            toast({ title: "Champs requis", description: "Veuillez remplir votre nom complet et votre numéro WhatsApp.", variant: "destructive" });
            return;
        }
        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ name: name, whatsapp_number: whatsapp })
            .eq('id', user.id);
        setLoading(false);

        if (error) {
            toast({ title: "Erreur", description: "Impossible de sauvegarder les informations.", variant: "destructive" });
        } else {
            toast({ title: "Succès", description: "Informations mises à jour." });
            if(onSuccess) onSuccess();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Informations requises</DialogTitle>
                    <DialogDescription>
                        Pour continuer, nous avons besoin de votre nom complet et de votre numéro WhatsApp. Ces informations seront utilisées pour la transaction.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nom complet
                        </Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="whatsapp" className="text-right">
                            N° WhatsApp
                        </Label>
                        <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+225 XX XX XX XX XX" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer et Continuer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InfoCollectionModal;