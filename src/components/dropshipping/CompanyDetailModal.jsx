import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Download, Globe, Image as ImageIcon, Info } from 'lucide-react';

export const CompanyDetailModal = ({ company, open, onOpenChange }) => {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" aria-labelledby="company-detail-title">
        <DialogHeader>
          <DialogTitle id="company-detail-title" className="flex items-center gap-4 text-3xl">
            <img src={company.logo_url} alt={`${company.name} logo`} className="w-16 h-16 rounded-full object-contain border-2 border-primary/20 p-1" />
            {company.name}
          </DialogTitle>
          <DialogDescription>Informations détaillées sur l'entreprise et ses produits.</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center"><Info className="w-5 h-5 mr-2 text-primary" />Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{company.description}</p>

            <h3 className="font-semibold text-lg mt-6 mb-2 flex items-center"><Globe className="w-5 h-5 mr-2 text-primary" />Pays de livraison</h3>
            <div className="flex flex-wrap gap-2">
              {company.available_countries?.map(country => (
                <Badge key={country} variant="secondary">{country}</Badge>
              ))}
            </div>
            
            {company.collaboration_pdf_url && (
              <Button asChild className="mt-6 w-full">
                <a href={company.collaboration_pdf_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger le PDF de collaboration
                </a>
              </Button>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center"><ImageIcon className="w-5 h-5 mr-2 text-primary" />Portfolio de produits</h3>
            {company.portfolio_images && company.portfolio_images.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={10}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                className="rounded-lg overflow-hidden"
              >
                {company.portfolio_images.map((imgUrl, index) => (
                  <SwiperSlide key={index}>
                    <img src={imgUrl} alt={`Produit ${index + 1}`} className="w-full h-64 object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p className="text-muted-foreground">Aucun produit dans le portfolio.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};