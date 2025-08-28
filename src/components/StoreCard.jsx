import React from 'react';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
    import { Store, Eye, Edit, Trash2, Copy, AlertTriangle, Gem } from 'lucide-react';
    import { motion } from 'framer-motion';

    export default function StoreCard({ store, onView, onEdit, onDelete, onCopyLink, delay, isSubscriptionActive }) {
      const getStatusColor = (status) => {
        switch (status) {
          case 'published': return 'bg-green-500';
          case 'draft': return 'bg-yellow-500';
          case 'suspended': return 'bg-red-500';
          default: return 'bg-gray-500';
        }
      };

      const getStatusText = (status) => {
        switch (status) {
          case 'published': return 'En ligne';
          case 'draft': return 'Brouillon';
          case 'suspended': return 'Suspendue';
          default: return 'Inconnu';
        }
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay }}
          className="h-full flex flex-col"
        >
          <Card className="flex-grow flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-contain rounded-lg" /> : <Store className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <CardDescription>{store.store_type === 'physical' ? 'Boutique Physique' : 'Boutique Digitale'}</CardDescription>
                        {store.store_type === 'physical' && isSubscriptionActive && (
                            <Badge variant="outline" className="border-amber-400 text-amber-500 bg-amber-400/10 text-xs">
                                <Gem className="w-3 h-3 mr-1" />
                                Premium
                            </Badge>
                        )}
                    </div>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(store.status)}`} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getStatusText(store.status)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-sm line-clamp-2">
                {store.description || "Aucune description pour cette boutique."}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 bg-muted/50 p-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onView}><Eye className="w-4 h-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Voir</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onEdit}><Edit className="w-4 h-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Modifier</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onCopyLink}><Copy className="w-4 h-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Copier le lien</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Supprimer</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
            {store.store_type === 'physical' && !isSubscriptionActive && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
                  <p className="font-semibold text-amber-600">Abonnement requis</p>
                  <p className="text-xs text-muted-foreground mb-4">Publiez cette boutique avec un plan premium.</p>
              </div>
            )}
          </Card>
        </motion.div>
      );
    }