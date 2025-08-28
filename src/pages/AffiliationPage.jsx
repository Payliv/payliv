import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Award, BarChart, Users, ArrowRight, DollarSign, Gift, HelpCircle, Rocket, Smartphone, Landmark, CircleDollarSign, Copy, Check, Download, MessageSquare, Mail, Instagram } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const StepCard = ({ icon: Icon, step, title, description }) => (
    <div className="relative z-10">
        <div className="relative bg-card p-8 rounded-2xl border border-border shadow-sm text-center">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold border-4 border-background">
                {step}
            </div>
            <div className="mt-8">
                <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    </div>
);

const BenefitCard = ({ icon: Icon, title, description, children }) => (
    <div className="glass-effect p-8 rounded-2xl h-full flex flex-col text-center md:text-left">
        <div className="flex justify-center md:justify-start">
            <div className="w-16 h-16 mb-6 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8 text-foreground" />
            </div>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        {children && <div className="mt-4">{children}</div>}
    </div>
);

const PaymentMethods = () => (
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-background/50 border border-border">
            <Smartphone className="w-5 h-5 text-green-500"/>
            <span className="text-sm font-medium text-foreground">Mobile Money</span>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-background/50 border border-border">
            <Landmark className="w-5 h-5 text-blue-500"/>
            <span className="text-sm font-medium text-foreground">Nita</span>
        </div>
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-background/50 border border-border">
            <CircleDollarSign className="w-5 h-5 text-yellow-500"/>
            <span className="text-sm font-medium text-foreground">USDT TRC20</span>
        </div>
    </div>
);

const CopyableTextCard = ({ title, text, icon: Icon }) => {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        const textToCopy = text.replace(/\[TON LIEN D’AFFILIÉ\]/g, 'https://payliv.pro?ref=VOTRE_CODE');
        navigator.clipboard.writeText(textToCopy);
        toast({ title: "Texte copié !", description: "Le lien d'affilié sera remplacé par le vôtre dans votre tableau de bord." });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <Icon className="mr-3 h-5 w-5 text-primary" /> {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md border">{text}</p>
                <Button onClick={handleCopy} className="mt-4">
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? 'Copié !' : 'Copier le texte'}
                </Button>
            </CardContent>
        </Card>
    );
};

const AffiliationPage = () => {
    const { user } = useAuth();
    const commissionRate = "10%";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    };

    const faqs = [
        {
            question: "Combien puis-je gagner ?",
            answer: `Vous touchez une commission de ${commissionRate} sur le premier paiement d'abonnement de vos filleuls. Il n'y a pas de limite au nombre de personnes que vous pouvez parrainer !`
        },
        {
            question: "Comment suis-je payé ?",
            answer: "Recevez vos gains en moins de 5 minutes ! Les paiements sont ultra-rapides et disponibles via Mobile Money, Nita et même en crypto (USDT TRC20)."
        },
        {
            question: "Comment puis-je suivre mes parrainages ?",
            answer: "Vous aurez accès à un tableau de bord d'affiliation complet où vous pourrez suivre en temps réel le nombre de clics, d'inscriptions et les commissions générées."
        },
        {
            question: "Dois-je être un client PayLiv pour devenir affilié ?",
            answer: "Oui, notre programme d'affiliation est exclusivement réservé à nos utilisateurs. Nous croyons que les meilleurs ambassadeurs sont ceux qui utilisent et aiment notre produit."
        }
    ];

    const marketingTexts = {
        whatsapp: `👋 Salut ! Tu veux vendre en ligne en Afrique avec paiement à la livraison ?\nJ’ai une solution simple, pas chère et locale : PayLiv\nCrée ta boutique pour seulement 1000 FCFA/mois\n👉 Clique ici et inscris-toi avec mon lien : [TON LIEN D’AFFILIÉ]`,
        social: `🛒 Tu veux lancer ton business en ligne sans carte bancaire ?\nAvec PayLiv, tu crées ta boutique pour 1000 FCFA/mois, et tu es payé à la livraison.\n💥 Zéro stress, zéro arnaque\n💚 Une solution 100% africaine\n🤑 Et moi je gagne une commission quand tu t’inscris avec mon lien 😎\n➡️ Inscris-toi ici 👉 [TON LIEN D’AFFILIÉ]`,
        email: `Objet : Crée ta boutique en ligne pour 1000 FCFA !\n\nBonjour,\n\nJe voulais te partager une super plateforme que j’utilise : PayLiv.\n\nElle te permet de vendre en ligne avec paiement à la livraison, parfait pour l’Afrique.\n\nTon abonnement commence à 1000 FCFA/mois, et pas besoin de carte bancaire !\n\nInscris-toi ici avec mon lien 👉 [TON LIEN D’AFFILIÉ]\n\nEt si tu as besoin d’aide, je peux t’accompagner pour créer ta boutique.\n\nÀ bientôt !`
    };

    const marketingVisuals = [
        {
            url: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/342b9db761bcefe6da76bfec2c57328.jpg",
            alt: "Visuel promotionnel PayLiv pour affiliation 1"
        },
        {
            url: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/9415d2caab67d9c39c414f38c5ac2e0d.jpg",
            alt: "Visuel promotionnel PayLiv pour affiliation 2"
        },
        {
            url: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/fda7719f351c70c305e203b6e62eb4d8.jpg",
            alt: "Visuel promotionnel PayLiv pour affiliation 3"
        },
        {
            url: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/72aaf1395e8db31ede265e88772191ba.jpg",
            alt: "Visuel promotionnel PayLiv pour affiliation 4"
        },
        {
            url: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/dc8e8491f1aa5ca9e0e52b82d2b904ba.jpg",
            alt: "Visuel promotionnel PayLiv pour affiliation 5"
        },
        {
            url: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/e59d6e96cadacd33652e67d17e00e642.jpg",
            alt: "Visuel promotionnel PayLiv pour affiliation 6"
        }
    ];

    return (
        <>
            <Helmet>
                <title>Programme d'Affiliation PayLiv - Gagnez 10% de Commission</title>
                <meta name="description" content="Rejoignez le programme d'affiliation de PayLiv, gagnez 10% de commission sur le premier abonnement de vos filleuls et recevez vos paiements rapidement." />
            </Helmet>

            <div className="bg-background text-foreground">
                <section className="py-20 md:py-32 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/10 -z-10"></div>
                     <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
                    <div className="max-w-4xl mx-auto px-4">
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold gradient-text">
                                Devenez partenaire PayLiv.
                            </motion.h1>
                            <motion.p variants={itemVariants} className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                                Recommandez la plateforme e-commerce leader en Afrique et générez des revenus. C'est simple, transparent et gratifiant.
                            </motion.p>
                            <motion.div variants={itemVariants} className="mt-10">
                                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-accent text-lg px-8 py-6 shadow-lg shadow-primary/20">
                                    <Link to={user ? "/affiliate" : "/signup"}>
                                        {user ? "Accéder à mon tableau de bord" : "Devenir Partenaire Maintenant"}
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="max-w-5xl mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
                        <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">Gagnez des commissions en seulement 3 étapes simples.</p>
                        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-12">
                                <svg width="100%" height="2">
                                    <line x1="0" y1="1" x2="100%" y2="1" strokeWidth="2" strokeDasharray="8 8" className="stroke-border" />
                                </svg>
                            </div>
                            <StepCard icon={Users} step="1" title="Inscrivez-vous" description="Créez votre compte PayLiv. Chaque utilisateur a automatiquement accès au programme d'affiliation." />
                            <StepCard icon={Award} step="2" title="Partagez votre lien" description="Obtenez votre lien d'affiliation unique depuis votre tableau de bord et partagez-le avec votre audience." />
                            <StepCard icon={DollarSign} step="3" title="Gagnez une commission" description={`Touchez ${commissionRate} de commission sur le premier abonnement premium de vos filleuls.`} />
                        </div>
                    </div>
                </section>
                
                <section className="py-20 bg-muted/20">
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold">Votre Boîte à Outils d'Affilié 🚀</h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Pour vous aider à attirer des filleuls efficacement, voici une boîte à outils complète.
                            </p>
                        </div>
                        <Tabs defaultValue="texts" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="texts">Textes Prêts à l’emploi</TabsTrigger>
                                <TabsTrigger value="visuals">Visuels Promotionnels</TabsTrigger>
                            </TabsList>
                            <TabsContent value="texts" className="mt-8">
                                <div className="grid gap-6">
                                    <CopyableTextCard title="Texte WhatsApp" text={marketingTexts.whatsapp} icon={MessageSquare} />
                                    <CopyableTextCard title="Post Facebook / Instagram" text={marketingTexts.social} icon={Instagram} />
                                    <CopyableTextCard title="Email" text={marketingTexts.email} icon={Mail} />
                                </div>
                            </TabsContent>
                            <TabsContent value="visuals" className="mt-8">
                                <div className="grid md:grid-cols-3 gap-6">
                                    {marketingVisuals.map((visual, index) => (
                                        <Card key={index} className="overflow-hidden">
                                            <CardContent className="p-0">
                                                <img src={visual.url} alt={visual.alt} className="w-full h-auto object-cover aspect-square" />
                                                <div className="p-4">
                                                    <Button asChild className="w-full">
                                                        <a href={visual.url} download={`payliv-promo-${index + 1}.jpg`}>
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Télécharger
                                                        </a>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </section>
                
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold">Un partenariat gagnant-gagnant</h2>
                            <p className="mt-4 text-lg text-muted-foreground">Les avantages de notre programme d'affiliation.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <BenefitCard icon={DollarSign} title="Commission Unique" description={`Gagnez une commission de ${commissionRate} sur le tout premier abonnement premium activé par vos filleuls. C'est simple et direct !`} />
                            <BenefitCard icon={BarChart} title="Tableau de bord complet" description="Suivez vos performances en temps réel avec des statistiques détaillées sur les clics, les inscriptions et les gains." />
                            <BenefitCard icon={Rocket} title="Paiements Ultra-Rapides" description="Recevez vos gains en moins de 5 minutes. Nous supportons plusieurs méthodes de retrait pour votre confort.">
                                <PaymentMethods />
                            </BenefitCard>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-muted/20">
                    <div className="max-w-3xl mx-auto px-4">
                         <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold">Questions fréquentes</h2>
                            <p className="mt-4 text-lg text-muted-foreground">Tout ce que vous devez savoir sur notre programme.</p>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>
                
                <section className="py-20">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }}>
                            <h2 className="text-3xl md:text-5xl font-extrabold gradient-text">Prêt à commencer ?</h2>
                            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                                Rejoignez des centaines de partenaires qui développent leurs revenus avec PayLiv.
                            </p>
                            <div className="mt-10">
                                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-accent text-lg px-8 py-6 shadow-lg shadow-primary/20">
                                     <Link to={user ? "/affiliate" : "/signup"}>
                                        Commencer à gagner
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default AffiliationPage;