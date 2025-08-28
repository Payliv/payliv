import React from 'react';
import { Link } from 'react-router-dom';

const PAYLIV_LOGO_URL = 'https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/de76d88e7eda758e55e3b51aa774b826.png';

const StoreFooter = ({ store }) => {
  const storeName = store?.name || 'Votre Boutique';
  const storeLogo = store?.logo;

  return (
    <footer className="bg-muted/50 text-muted-foreground py-8 px-4 sm:px-6 lg:px-8 mt-16 border-t">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-3">
            {storeLogo && <img src={storeLogo} alt={`${storeName} logo`} className="h-8 sm:h-10 w-auto object-contain rounded-md" />}
            <span className="font-bold text-lg sm:text-xl text-foreground text-center sm:text-left">{storeName}</span>
          </div>

          <div className="md:col-span-1">
             <h4 className="font-semibold text-foreground mb-4">Légales</h4>
             <ul className="space-y-2">
                 <li><Link to="/privacy" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
                 <li><Link to="/terms" className="hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
             </ul>
          </div>

          <div className="md:col-span-1">
             <h4 className="font-semibold text-foreground mb-4">Support</h4>
             <ul className="space-y-2">
                 <li><Link to="/help" className="hover:text-primary transition-colors">Centre d'aide</Link></li>
             </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 mt-8 space-y-4 text-center text-xs">
            <p className="max-w-3xl mx-auto">
              Ce site n'est en aucun cas affilié à Facebook ou Meta. Nous utilisons la publicité pour promouvoir nos contenus et produits/services auprès d'un public plus large. Les informations fournies sur ce site sont uniquement à titre informatif et ne constituent pas un conseil professionnel ou financier.
            </p>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
                <span className="text-foreground">© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
                <a href="https://payliv.shop" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                    <span>Propulsé par</span>
                    <img src={PAYLIV_LOGO_URL} alt="PayLiv Logo" className="h-5 w-auto" />
                </a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;