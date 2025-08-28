import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const footerLinks = [
  {
    title: 'Solutions',
    links: [
      { name: 'E-commerce Traditionnel', href: '/solutions/ecommerce-traditionnel' },
      { name: 'Dropshipping', href: '/solutions/dropshipping' },
      { name: 'Marketplace', href: '/marketplace' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { name: 'Documentation', href: '/documentation' },
      { name: 'Centre d\'aide', href: '/help' },
      { name: 'Devenir Partenaire', href: '/solutions/dropshipping' },
      { name: 'Devenir Affilié', href: '/affiliation' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { name: 'À propos', href: '/about' },
      { name: 'Tarifs', href: '/pricing' },
      { name: 'Fonctionnalités', href: '/features' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { name: 'Confidentialité', href: '/privacy' },
      { name: 'Conditions d\'utilisation', href: '/terms' },
    ],
  },
];

const socialLinks = [
  { name: 'Facebook', href: '#', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg> },
  { name: 'Instagram', href: '#', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 0C9.58 0 9.22.01 8.134.059 7.028.108 6.054.287 5.17.66 4.244 1.061 3.475 1.68 2.73 2.424a6.873 6.873 0 00-1.745 2.746c-.373.885-.552 1.859-.601 2.965C.01 9.22 0 9.58 0 12s.01 2.78.059 3.866c.049 1.106.228 2.08.601 2.965a6.873 6.873 0 002.424 2.746c.745.745 1.514 1.364 2.44 1.745.885.373 1.859.552 2.965.601C9.22 23.99 9.58 24 12 24s2.78-.01 3.866-.059c1.106-.049 2.08-.228 2.965-.601a6.873 6.873 0 002.746-2.424c.745-.745 1.364-1.514 1.745-2.44.373-.885.552-1.859.601-2.965C23.99 14.78 24 14.42 24 12s-.01-2.78-.059-3.866c-.049-1.106-.228-2.08-.601-2.965a6.873 6.873 0 00-2.424-2.746c-.745-.745-1.514-1.364-2.44-1.745-.885-.373-1.859-.552-2.965-.601C14.78.01 14.42 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" clipRule="evenodd" /></svg> },
  { name: 'Twitter', href: '#', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg> },
];

export default function PublicFooter() {
  return (
    <footer className="bg-card/30 border-t border-border" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="pb-8 xl:grid xl:grid-cols-4 xl:gap-8">
          <div className="space-y-8 xl:col-span-1 mb-12 xl:mb-0">
            <img
              className="h-10"
              src="https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/9fb76018a6a7707af2685c48d03293f0.png"
              alt="PayLiv"
            />
            <p className="text-muted-foreground text-base">
              La plateforme tout-en-un pour lancer et faire grandir votre business en ligne en Afrique.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a key={item.name} href={item.href} className="text-muted-foreground hover:text-primary">
                  <span className="sr-only">{item.name}</span>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 xl:col-span-3 xl:grid-cols-4">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">{section.title}</h3>
                <ul className="mt-4 space-y-4">
                  {section.links.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-base text-muted-foreground hover:text-primary">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  {section.title === 'Légal' && (
                    <li>
                      <Link to="/my-purchases" className="text-base text-muted-foreground hover:text-primary">
                        Accéder à mes achats
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-base text-muted-foreground xl:text-center">&copy; {new Date().getFullYear()} PayLiv. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}