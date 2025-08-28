import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, DollarSign, Package } from 'lucide-react';

const PricingSection = () => {
  return (
    <section className="py-20 sm:py-32 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-foreground flex items-center justify-center gap-3"
          >
            <Smartphone className="w-10 h-10 text-primary" />
            Les paiements par Mobile Money pour les boutiques digitales
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground max-w-4xl mx-auto"
          >
            C'est la méthode de paiement reine en Afrique ! Pour vos produits digitaux, le processus est ultra-simple pour vos clients :
          </motion.p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              "Choix du mode de paiement : Sur votre boutique, le client sélectionne son opérateur Mobile Money préféré (Orange Money, MTN MoMo, Wave, Moov Money, etc.).",
              "Saisie du numéro : Il entre son numéro de téléphone Mobile Money.",
              "Confirmation sur le téléphone : Une notification apparaît directement sur son téléphone. Il n'a qu'à valider la transaction en entrant son code PIN.",
              "Paiement instantané : La transaction est confirmée en quelques secondes !",
              "Livraison automatique : Dès que le paiement est validé, notre système envoie automatiquement le produit digital (lien de téléchargement, accès à un contenu, etc.) au client, souvent par e-mail ou WhatsApp. Magique, non ? ✨"
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-card p-6 rounded-lg shadow-md border border-border/50"
              >
                <h3 className="text-xl font-semibold text-primary mb-2">{index + 1}.</h3>
                <p className="text-muted-foreground">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2"
          >
            <DollarSign className="w-8 h-8 text-green-500" /> Commissions et frais : La transparence avant tout !
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mb-8"
          >
            Quand un client paie par Mobile Money, il y a quelques frais à prendre en compte :
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-card p-6 rounded-lg shadow-md border border-border/50"
            >
              <h4 className="text-xl font-bold text-foreground mb-2">Frais de la passerelle de paiement :</h4>
              <p className="text-muted-foreground">Les opérateurs Mobile Money et les agrégateurs (comme CinetPay, PayDunya) prélèvent une commission sur chaque transaction (généralement entre 1% et 3%) et pour les retraits (également 1% à 3%). Ces frais varient selon le pays et l'opérateur. <span className="font-bold text-primary">Bonne nouvelle : tous ces frais sont couverts par PayLiv dans notre commission de 15%, et le retrait est gratuit ! Les retraits sont traités ultra-rapidement, de 10 minutes à 3 heures maximum.</span></p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="bg-card p-6 rounded-lg shadow-md border border-border/50"
            >
              <h4 className="text-xl font-bold text-foreground mb-2">Frais de la plateforme (PayLiv) :</h4>
              <p className="text-muted-foreground">Pour les produits digitaux, PayLiv prélève une commission de <span className="font-bold text-primary">15%</span> sur le prix de vente. C'est notre façon de couvrir les coûts de la plateforme, du support, de la sécurité et de toutes les fonctionnalités géniales que nous vous offrons !</p>
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="mt-8 text-xl font-bold text-center text-foreground"
          >
            Votre revenu net = Prix de vente - <span className="text-primary">Frais de la plateforme (15% incluant les frais de passerelle)</span>.
          </motion.p>
        </div>

        <div className="mt-20">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2"
          >
            <Package className="w-8 h-8 text-purple-500" /> Le Dropshipping de produits digitaux : Un modèle gagnant-gagnant !
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-4 text-lg text-muted-foreground max-w-4xl mx-auto text-center"
          >
            Le dropshipping de produits digitaux, c'est l'avenir ! Voici comment les paiements et les commissions s'articulent :
          </motion.p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              "Le client paie votre boutique : Comme expliqué plus haut, le client achète un produit digital sur votre boutique et paie par Mobile Money.",
              "La plateforme gère tout : PayLiv reçoit le paiement, déduit les frais de la passerelle et sa propre commission de 15%.",
              "Rémunération du fournisseur : La part du fournisseur (le prix de gros que vous avez négocié avec lui) est automatiquement créditée sur son solde PayLiv.",
              "Votre commission : Votre commission (le prix de vente - le prix de gros du fournisseur - les frais PayLiv) est créditée sur votre propre solde PayLiv.",
              "Livraison par le fournisseur : Le fournisseur est notifié de la vente et envoie le produit digital directement au client."
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                className="bg-card p-6 rounded-lg shadow-md border border-border/50"
              >
                <h3 className="text-xl font-semibold text-primary mb-2">{index + 1}.</h3>
                <p className="text-muted-foreground">{step}</p>
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.8 }}
            className="mt-12 text-lg text-muted-foreground max-w-4xl mx-auto text-center"
          >
            En résumé : Le Mobile Money rend les paiements super accessibles en Afrique, et notre système s'assure que les frais sont clairs et que les commissions sont automatiquement réparties, même pour le dropshipping de produits digitaux. Vous vous concentrez sur la vente, nous gérons le reste !
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;