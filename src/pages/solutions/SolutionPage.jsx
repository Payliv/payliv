import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const solutionsData = {
  'ecommerce-ci': {
    title: "Solution E-commerce en Côte d'Ivoire",
    description: "Lancez votre boutique en ligne en Côte d'Ivoire avec PayLiv. Profitez d'une plateforme optimisée pour le marché ivoirien, avec une gestion simplifiée du paiement à la livraison.",
    features: [
      "Intégration des moyens de paiement locaux",
      "Gestion des livraisons à Abidjan et dans les grandes villes",
      "Support en français et devises locales (XOF)",
      "Marketing adapté aux consommateurs ivoiriens"
    ],
    image: "An aerial view of Abidjan's skyline with modern buildings and lagoons."
  },
  'dropshipping-sn': {
    title: "Solution Dropshipping au Sénégal",
    description: "Démarrez votre activité de dropshipping au Sénégal sans stock. PayLiv vous connecte à des fournisseurs et automatise vos commandes, du client à la livraison.",
    features: [
      "Catalogue de produits de fournisseurs locaux et internationaux",
      "Automatisation des commandes et des paiements",
      "Suivi des livraisons à Dakar et dans les régions",
      "Outils marketing pour cibler le marché sénégalais"
    ],
    image: "A bustling market scene in Dakar, Senegal with colorful textiles."
  },
  'vente-en-ligne-cm': {
    title: "Vente en ligne au Cameroun",
    description: "Vendez vos produits en ligne au Cameroun grâce à PayLiv. Créez une boutique professionnelle et touchez des clients à Douala, Yaoundé et au-delà.",
    features: [
      "Plateforme facile à utiliser, sans compétences techniques",
      "Gestion du paiement à la livraison pour rassurer les clients",
      "Optimisation mobile pour les utilisateurs camerounais",
      "Support pour les transactions en Franc CFA (XAF)"
    ],
    image: "Mount Cameroon, an active volcano, with lush green surroundings."
  }
};

const SolutionPage = () => {
  const { solutionId } = useParams();
  const solution = solutionsData[solutionId];

  if (!solution) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{solution.title} - PayLiv</title>
        <meta name="description" content={solution.description} />
      </Helmet>
      <div className="container mx-auto max-w-5xl py-12 px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight gradient-text mb-4">{solution.title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{solution.description}</p>
            <ul className="space-y-4">
              {solution.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Card className="overflow-hidden">
              <img  className="w-full h-auto object-cover aspect-video" alt={solution.title} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolutionPage;