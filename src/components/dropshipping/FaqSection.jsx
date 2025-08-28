import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqItems = [
  {
    question: "Comment fonctionne le partenariat de dropshipping ?",
    answer: "C'est simple ! Après votre inscription et le paiement unique, vous accédez à votre tableau de bord fournisseur. Vous y ajoutez vos produits, fixez vos prix de gros, et ils deviennent instantanément disponibles pour notre réseau de vendeurs."
  },
  {
    question: "Qui gère les commandes et la livraison ?",
    answer: "Un vendeur reçoit une commande pour votre produit. Vous êtes notifié automatiquement. Vous n'avez plus qu'à préparer la commande et l'expédier à l'adresse du client final. Le vendeur, lui, gère la communication client."
  },
  {
    question: "Comment suis-je payé pour mes ventes ?",
    answer: "Dès qu'une commande est marquée comme livrée, votre part (le prix de gros que vous avez fixé) est créditée sur votre solde PayLiv. Vous pouvez ensuite demander un retrait de vos gains quand vous le souhaitez."
  },
  {
    question: "Dois-je payer un abonnement en tant que fournisseur ?",
    answer: "Non, l'accès au programme fournisseur est un paiement unique à vie. Cependant, si vous souhaitez en plus avoir votre propre boutique en ligne sur PayLiv pour vendre directement aux clients, un abonnement standard sera nécessaire pour cette boutique."
  },
  {
    question: "Quels sont les avantages à devenir fournisseur sur PayLiv ?",
    answer: "Vous bénéficiez d'une force de vente de milliers de vendeurs sans dépenser un centime en marketing. Vous vous concentrez sur ce que vous faites de mieux : vos produits et la logistique. C'est une expansion de votre activité à moindre coût et à moindre risque."
  }
];

export const FaqSection = () => (
  <section className="py-20">
    <div className="max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-center mb-12">Foire Aux Questions (FAQ)</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);