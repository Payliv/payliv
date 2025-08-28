import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Mail, Phone, Download, GitFork, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, getStatusIcon, getStatusColor, getStatusLabel } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function OrderCard({ 
  order, 
  onUpdateStatus,
  delay = 0 
}) {
  const StatusIcon = getStatusIcon(order.status);
  const isDigitalOnly = order.has_digital && !order.has_physical;

  const getNextStatus = (currentStatus) => {
    if (isDigitalOnly) return null;
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'shipped';
      case 'shipped': return 'delivered';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus) => {
    if (isDigitalOnly) return null;
    switch (currentStatus) {
      case 'pending': return 'Confirmer';
      case 'confirmed': return 'Expédier';
      case 'shipped': return 'Marquer comme livrée';
      default: return null;
    }
  };

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'XOF': return 'CFA';
      default: return currency;
    }
  };

  const nextStatus = getNextStatus(order.status);
  const nextStatusLabel = getNextStatusLabel(order.status);
  const currencySymbol = getCurrencySymbol(order.currency);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`Commande #${order.id.slice(-6)}`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Boutique: ${order.store_name || 'N/A'}`, 14, 30);
    doc.text(`Date: ${new Date(order.created_at).toLocaleString('fr-FR')}`, 14, 36);
    doc.text(`Statut: ${getStatusLabel(order.status)}`, 14, 42);

    doc.autoTable({
      startY: 50,
      head: [['Client', 'Contact']],
      body: [
        ['Nom', order.customer.name],
        ['Téléphone', order.customer.phone],
        ['Ville', order.customer.city],
      ],
      theme: 'striped'
    });

    const tableColumn = ["Article", "Quantité", "Prix Unitaire", "Total"];
    const tableRows = [];

    order.items.forEach(item => {
      const itemData = [
        item.name,
        item.quantity,
        `${item.price.toLocaleString()} ${currencySymbol}`,
        `${(item.price * item.quantity).toLocaleString()} ${currencySymbol}`
      ];
      tableRows.push(itemData);
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid'
    });

    doc.setFontSize(14);
    doc.text(`Total de la commande: ${order.total.toLocaleString()} ${currencySymbol}`, 14, doc.lastAutoTable.finalY + 15);

    doc.save(`commande_${order.id.slice(-6)}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300 border border-border"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn(`w-10 h-10 rounded-full bg-muted flex items-center justify-center`, getStatusColor(order.status))}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Commande #{order.id.slice(-6)}
            </h3>
            <p className="text-sm text-muted-foreground">{order.store_name || 'Boutique inconnue'}</p>
          </div>
        </div>
        
        <div className="text-right">
          <span className={cn(`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted`, getStatusColor(order.status))}>
            {getStatusLabel(order.status)}
          </span>
          <p className="text-lg font-bold text-card-foreground mt-1">
            {order.total.toLocaleString()} {currencySymbol}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-b border-border pb-4">
        <div>
          <h4 className="text-sm font-medium text-card-foreground mb-2">Client</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2"><User className="w-4 h-4 text-primary" /><span>{order.customer.name}</span></div>
            {order.customer.email && <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-primary" /><span>{order.customer.email}</span></div>}
            <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-primary" /><span>{order.customer.phone}</span></div>
            {!isDigitalOnly && <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-primary" /><span>{order.customer.city}</span></div>}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-card-foreground mb-2">Articles commandés</h4>
          <div className="space-y-1 text-sm max-h-24 overflow-y-auto scrollbar-hide">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  {item.product_type === 'digital' 
                    ? <TooltipProvider><Tooltip><TooltipTrigger><Download className="w-4 h-4 text-primary flex-shrink-0" /></TooltipTrigger><TooltipContent><p>Produit Digital</p></TooltipContent></Tooltip></TooltipProvider>
                    : <TooltipProvider><Tooltip><TooltipTrigger><Package className="w-4 h-4 text-primary flex-shrink-0" /></TooltipTrigger><TooltipContent><p>Produit Physique</p></TooltipContent></Tooltip></TooltipProvider>
                  }
                  <span className="truncate">{item.name} x{item.quantity}</span>
                  {item.source_product_id && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <GitFork className="w-3 h-3 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Produit Dropshipping</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </span>
                <span className="text-card-foreground font-medium">
                  {(item.price * item.quantity).toLocaleString()} {currencySymbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 gap-4">
        <div className="flex flex-wrap gap-2">
          {nextStatus && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(order.id, nextStatus)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {nextStatusLabel}
            </Button>
          )}

          {!isDigitalOnly && order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
            >
              Annuler
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={downloadPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-muted-foreground self-end sm:self-center">
          <Calendar className="w-3 h-3" />
          <span>{new Date(order.created_at).toLocaleString('fr-FR')}</span>
        </div>
      </div>
    </motion.div>
  );
}