import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, Truck, PackageCheck, Banknote } from 'lucide-react';

const featuresData = {
  'paiement-livraison': {
    title: "Paiement à la Livraison Simplifié",
    description: "Le paiement à la livraison est le mode de paiement le plus populaire et le plus rassurant en Afrique. PayLiv intègre une gestion complète de ce service pour booster votre taux de conversion et la confiance de vos clients.",
    benefits: [
      {
        icon: ThumbsUp,
        title: "Confiance Client Accrue",
        text: "Les clients paient uniquement lorsqu'ils reçoivent leur colis, ce qui élimine la peur des arnaques en ligne."
      },
      {
        icon: Truck,
        title: "Logistique Intégrée",
        text: "Nous travaillons avec des partenaires de livraison fiables pour assurer le suivi et la remise des paiements."
      },
      {
        icon: PackageCheck,
        title: "Taux de Conversion Élevé",
        text: "Proposer le paiement à la livraison peut augmenter vos ventes de manière significative sur le marché africain."
      },
      {
        icon: Banknote,
        title: "Gestion Simplifiée des Retours",
        text: "Notre système facilite la gestion des fonds et des éventuels retours de commandes."
      }
    ],
    image: "A delivery person handing a package to a happy customer at their doorstep."
  }
};

const FeaturePage = () => {
  const { featureId } = useParams();
  const feature = featuresData[featureId];

  if (!feature) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{feature.title} - PayLiv</title>
        <meta name="description" content={feature.description} />
      </Helmet>
      <div className="container mx-auto max-w-5xl py-12 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight gradient-text mb-4">{feature.title}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{feature.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            <div>
                 <Card className="overflow-hidden shadow-lg">
                    <img  className="w-full h-auto object-cover aspect-video" alt={feature.title} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                </Card>
            </div>
            <div className="space-y-6">
                {feature.benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                        <Card key={index} className="bg-card/50">
                            <CardContent className="p-6 flex items-start">
                                <Icon className="w-8 h-8 text-primary mr-4 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-1">{benefit.title}</h3>
                                    <p className="text-muted-foreground">{benefit.text}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
      </div>
    </>
  );
};

export default FeaturePage;