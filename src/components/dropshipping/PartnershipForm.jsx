import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import { countries } from '@/lib/countries';

export const PartnershipForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    confirmPhone: '',
    companyName: '',
    countryCode: 'CI',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleConfirmPhoneChange = (value) => {
    setFormData(prev => ({ ...prev, confirmPhone: value }));
  };

  const handleCountryCodeChange = (code) => {
    setFormData(prev => ({ ...prev, countryCode: code }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.companyName || !formData.countryCode) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs du formulaire.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.phone !== formData.confirmPhone) {
      toast({
        title: 'Les numéros ne correspondent pas',
        description: 'Veuillez vérifier les numéros de téléphone saisis.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const countryLabel = countries.find(c => c.value === formData.countryCode)?.label || formData.countryCode;

    const message = `
Bonjour, je souhaite devenir partenaire dropshipping.
Voici mes informations :
-------------------------
Nom complet: ${formData.name}
Email: ${formData.email}
Téléphone: ${formData.phone}
Nom de l'entreprise: ${formData.companyName}
Pays: ${countryLabel}
-------------------------
Frais d'inscription: 10.000 FCFA
    `.trim().replace(/^\s+/gm, '');

    const whatsappUrl = `https://wa.me/22794720307?text=${encodeURIComponent(message)}`;

    window.location.href = whatsappUrl;

    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl shadow-primary/10 border-border">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="vous@exemple.com" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom de l'entreprise</Label>
            <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Ex: Global SARL" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone (WhatsApp)</Label>
            <PhoneInput 
              id="phone" 
              value={formData.phone} 
              onChange={handlePhoneChange} 
              country={formData.countryCode}
              onCountryChange={handleCountryCodeChange}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPhone">Confirmer le numéro</Label>
            <PhoneInput 
              id="confirmPhone" 
              value={formData.confirmPhone} 
              onChange={handleConfirmPhoneChange} 
              country={formData.countryCode}
              onCountryChange={handleCountryCodeChange}
              required 
            />
          </div>
          <Button type="submit" className="w-full text-lg py-6 font-bold" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Soumettre via WhatsApp'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};