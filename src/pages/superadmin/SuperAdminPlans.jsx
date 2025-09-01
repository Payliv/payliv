import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, CheckSquare, Star } from 'lucide-react';

const PlanForm = ({ plan, onSave, closeDialog }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    currency: 'XOF',
    frequency: 'monthly',
    features: '',
    is_popular: false,
    ...plan,
    features: plan?.features ? plan.features.join('\n') : '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const planData = {
      ...formData,
      price: parseFloat(formData.price),
      features: formData.features.split('\n').filter(f => f.trim() !== ''),
    };
    
    let error;
    if (planData.id) {
      ({ error } = await supabase.from('subscription_plans').update(planData).eq('id', planData.id));
    } else {
      const { id, ...createData } = planData;
      ({ error } = await supabase.from('subscription_plans').insert(createData));
    }

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: `Formule ${planData.id ? 'mise à jour' : 'créée'} avec succès.` });
      onSave();
      closeDialog();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-foreground">Nom de la formule</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 bg-input border-border text-foreground" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="text-foreground">Prix</Label>
          <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="mt-1 bg-input border-border text-foreground" required />
        </div>
        <div>
          <Label htmlFor="currency" className="text-foreground">Devise</Label>
          <Select name="currency" value={formData.currency} onValueChange={(value) => handleSelectChange('currency', value)}>
            <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="XOF">XOF</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="frequency" className="text-foreground">Fréquence</Label>
        <Select name="frequency" value={formData.frequency} onValueChange={(value) => handleSelectChange('frequency', value)}>
          <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="monthly">Mensuel</SelectItem><SelectItem value="yearly">Annuel</SelectItem></SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="features" className="text-foreground">Fonctionnalités (une par ligne)</Label>
        <textarea id="features" name="features" value={formData.features} onChange={handleChange} rows="5" className="w-full mt-1 bg-input border-border text-foreground rounded-md p-2 focus:ring-primary focus:border-primary" required />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="is_popular" name="is_popular" checked={formData.is_popular} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))} />
        <Label htmlFor="is_popular" className="text-foreground">Marquer comme populaire</Label>
      </div>
      <DialogFooter>
        <Button type="submit" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Sauvegarder</Button>
      </DialogFooter>
    </form>
  );
};


export default function SuperAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('subscription_plans').select('*').order('price', { ascending: true });
    if (error) {
      toast({ title: "Erreur", description: "Impossible de charger les formules.", variant: "destructive" });
    } else {
      setPlans(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (planId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette formule ? Les abonnements existants liés à cette formule pourraient être affectés.")) {
      const { error } = await supabase.from('subscription_plans').delete().eq('id', planId);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Succès", description: "Formule supprimée." });
        fetchPlans();
      }
    }
  };

  const openDialog = (plan = null) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Gestion des Formules</h1>
          <p className="text-muted-foreground">Créez, modifiez et supprimez les formules d'abonnement.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog(null)} className="bg-primary text-primary-foreground hover:bg-accent w-full md:w-auto">
              <PlusCircle className="w-5 h-5 mr-2" />
              Nouvelle Formule
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect text-foreground border-border">
          <DialogContent className="glass-effect text-foreground border-border" aria-labelledby="plan-form-title">
            <DialogHeader>
              <DialogTitle id="plan-form-title" className="gradient-text">{selectedPlan ? 'Modifier la formule' : 'Créer une nouvelle formule'}</DialogTitle>
            </DialogHeader>
            <PlanForm plan={selectedPlan} onSave={fetchPlans} closeDialog={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </motion.div>

      {loading ? <p className="text-foreground text-center">Chargement...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative glass-effect rounded-2xl p-6 flex flex-col ${plan.is_popular ? 'border-2 border-primary' : 'border border-border'}`}
            >
              {plan.is_popular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Populaire</span>
                  </div>
                </div>
              )}

              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h2>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-lg text-muted-foreground ml-1">{plan.currency || 'XOF'}</span>
                  <span className="text-muted-foreground"> / {plan.frequency === 'monthly' ? 'mois' : 'an'}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckSquare className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button onClick={() => openDialog(plan)} variant="outline" size="icon" className="h-9 w-9 border-primary text-primary hover:bg-primary hover:text-primary-foreground"><Edit className="w-4 h-4" /></Button>
                <Button onClick={() => handleDelete(plan.id)} variant="destructive" size="icon" className="h-9 w-9"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}