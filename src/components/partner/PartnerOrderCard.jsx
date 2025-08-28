import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Phone, Package, User, Store, Calendar, Hash, MessageSquare } from 'lucide-react';

const PartnerOrderCard = ({ orderItem, onUpdateStatus, getStatusIcon, getStatusColor, getStatusLabel, delay }) => {
  const { order, seller_product, quantity, fulfillment_status, seller } = orderItem;
  const customer = order.customer;
  const StatusIcon = getStatusIcon(fulfillment_status);
  const statusColor = getStatusColor(fulfillment_status);
  const statusLabel = getStatusLabel(fulfillment_status);

  const canUpdate = fulfillment_status === 'confirmed' || fulfillment_status === 'shipped';

  const handleStatusUpdate = (newStatus) => {
    onUpdateStatus(orderItem.id, newStatus);
  };

  const getWhatsAppLink = (number) => {
    if (!number) return null;
    const cleanedNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanedNumber}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="overflow-hidden glass-effect">
        <CardHeader className="p-4 bg-muted/30 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-grow">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {seller_product.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs mt-1">
                <Hash className="w-3 h-3" /> Commande #{order.id.slice(-8)}
                <span className="mx-1">|</span>
                <Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className={`flex items-center gap-2 text-sm font-semibold p-2 rounded-md ${statusColor}`}>
                <StatusIcon className="w-4 h-4" />
                <span>{statusLabel}</span>
              </div>
              {canUpdate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {fulfillment_status === 'confirmed' && (
                      <DropdownMenuItem onClick={() => handleStatusUpdate('shipped')}>
                        Marquer comme Expédiée
                      </DropdownMenuItem>
                    )}
                    {fulfillment_status === 'shipped' && (
                      <DropdownMenuItem onClick={() => handleStatusUpdate('delivered')}>
                        Marquer comme Livrée
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Product Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Détails du produit</h4>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0">
                <img src={seller_product.image} alt={seller_product.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-bold text-foreground">{seller_product.name}</p>
                <p className="text-sm text-muted-foreground">Quantité: {quantity}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Client final</h4>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-primary" />
              <span className="text-foreground">{customer.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <span className="text-foreground">{customer.phone}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">{customer.address}</p>
          </div>

          {/* Seller Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Vendeur</h4>
            <div className="flex items-center gap-2 text-sm">
              <Store className="w-4 h-4 text-primary" />
              <span className="text-foreground">{seller.name}</span>
            </div>
            {seller.whatsapp_number && (
              <Button asChild variant="outline" size="sm" className="mt-2">
                <a href={getWhatsAppLink(seller.whatsapp_number)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Contacter sur WhatsApp
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PartnerOrderCard;