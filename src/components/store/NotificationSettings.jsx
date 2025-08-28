import React, { useState, useEffect, useRef } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Switch } from '@/components/ui/switch';
    import { PhoneInput } from '@/components/ui/phone-input';
    import { Bell, MessageSquare, Mail } from 'lucide-react';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';

    export default function NotificationSettings({ settings, onSettingsChange }) {
      const [showEmailPrompt, setShowEmailPrompt] = useState(false);
      const emailInputRef = useRef(null);

      const handleNotificationChange = (key, value) => {
        onSettingsChange({
          ...settings,
          notifications: {
            ...settings.notifications,
            [key]: value,
          },
        });
      };

      const handleWhatsappEnabledChange = (checked) => {
        onSettingsChange({
          ...settings,
          notifications: {
            ...settings.notifications,
            whatsapp_enabled: checked,
          },
        });
      };

      const handleWhatsappRecipientChange = (value) => {
        onSettingsChange({
          ...settings,
          notifications: {
            ...settings.notifications,
            whatsapp_recipient: value,
          },
        });
      };

      useEffect(() => {
        const hasSeenPrompt = sessionStorage.getItem('hasSeenEmailNotificationPrompt');
        if (!settings?.notifications?.orderRecipientEmail && !hasSeenPrompt) {
          setShowEmailPrompt(true);
          sessionStorage.setItem('hasSeenEmailNotificationPrompt', 'true');
        }
      }, [settings?.notifications?.orderRecipientEmail]);

      const handleAddEmailClick = () => {
        setShowEmailPrompt(false);
        if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
      };

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Bell className="w-5 h-5 mr-2 text-primary" />Notifications</CardTitle>
            <CardDescription>Gérez comment et où vous recevez les notifications de commande.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="orderRecipientEmail">E-mail pour les notifications de commande</Label>
              <Input
                id="orderRecipientEmail"
                type="email"
                placeholder="laissez vide pour utiliser l'e-mail du compte"
                value={settings?.notifications?.orderRecipientEmail || ''}
                onChange={(e) => handleNotificationChange('orderRecipientEmail', e.target.value)}
                ref={emailInputRef}
              />
            </div>
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp_enabled" className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <span>Notifications WhatsApp</span>
                </Label>
                <Switch
                  id="whatsapp_enabled"
                  checked={settings?.notifications?.whatsapp_enabled || false}
                  onCheckedChange={handleWhatsappEnabledChange}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Recevez une notification instantanée sur WhatsApp pour chaque nouvelle commande.</p>
              {settings?.notifications?.whatsapp_enabled && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="whatsapp_recipient">Numéro WhatsApp de réception</Label>
                  <PhoneInput
                    id="whatsapp_recipient"
                    value={settings?.notifications?.whatsapp_recipient || ''}
                    onChange={handleWhatsappRecipientChange}
                    placeholder="Entrez le numéro WhatsApp"
                  />
                </div>
              )}
            </div>
          </CardContent>

          <Dialog open={showEmailPrompt} onOpenChange={setShowEmailPrompt}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center text-primary"><Mail className="mr-2 h-5 w-5" /> Ne manquez aucune commande !</DialogTitle>
                <DialogDescription>
                  Pour être sûr de recevoir toutes les notifications de vos nouvelles commandes, veuillez ajouter un e-mail dédié ci-dessus.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEmailPrompt(false)}>
                  Plus tard
                </Button>
                <Button type="button" onClick={handleAddEmailClick}>
                  Ajouter mon e-mail maintenant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      );
    }