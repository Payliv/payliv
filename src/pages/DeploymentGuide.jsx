import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, UploadCloud, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DeploymentGuide = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold gradient-text mb-2">
                    Déployer votre Plateforme sur Hostinger
                </h1>
                <p className="text-muted-foreground">
                    Suivez ces étapes pour mettre votre application SaaS en ligne.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-8 space-y-8 border border-border"
            >
                <Step
                    icon={Terminal}
                    title="Étape 1: Exporter votre projet"
                    description="Cliquez sur le menu 'Hostinger Horizons' en haut à gauche de l'écran, puis sélectionnez 'Export Project'. Cela téléchargera un fichier .zip contenant tout le code de votre application."
                />
                <Step
                    icon={UploadCloud}
                    title="Étape 2: Uploader sur Hostinger"
                    description="Connectez-vous à votre compte Hostinger. Allez dans le 'Gestionnaire de fichiers' de votre plan d'hébergement. Uploadez le fichier .zip dans le dossier `public_html`, puis extrayez son contenu."
                />
                <Step
                    icon={LinkIcon}
                    title="Étape 3: Connecter votre domaine"
                    description="Assurez-vous que votre nom de domaine pointe vers votre hébergement Hostinger. Vous pouvez gérer cela depuis la section 'Domaines' de votre hPanel."
                />
                 <Step
                    icon={CheckCircle}
                    title="Étape 4: C'est en ligne !"
                    description="Une fois les fichiers uploadés et le domaine configuré, votre plateforme est prête ! Visitez votre nom de domaine pour voir votre application en direct. N'oubliez pas de configurer le domaine de base dans les paramètres Super Admin."
                />
                
                <div className="text-center pt-6">
                     <a href="https://www.hostinger.fr/tutoriels/comment-mettre-un-site-en-ligne" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-primary text-primary-foreground hover:bg-accent">
                            Voir le guide détaillé de Hostinger
                        </Button>
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

const Step = ({ icon: Icon, title, description }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    </div>
);

export default DeploymentGuide;