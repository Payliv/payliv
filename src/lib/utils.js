import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle, XCircle, Clock, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import React from 'react';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function getContrastingTextColor(hexColor) {
  if (!hexColor) return '#FFFFFF';

  const color = hexColor.charAt(0) === '#' ? hexColor.substring(1, 7) : hexColor;

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function harmonizeCategories(categories) {
  const categoryMapping = {
    'Mode & Vêtements': ['vetement', 'habit', 'mode', 'tissu', 'textile', 'chemise', 'pantalon', 'robe', 'jupe', 'fashion', 'clothing', 'couture', 'pret-a-porter', 'style', 't-shirt', 'polo', 'veste'],
    'Chaussures': ['chaussure', 'soulier', 'basket', 'talon', 'sandale', 'botte', 'shoes', 'mocassin', 'espadrille', 'sneaker'],
    'Sacs & Accessoires': ['sac', 'accessoire', 'bijou', 'montre', 'lunette', 'ceinture', 'chapeau', 'maroquinerie', 'portefeuille', 'collier', 'bracelet'],
    'Électronique': ['electronique', 'electro', 'tv', 'television', 'hifi', 'camera', 'audio', 'video', 'drone', 'enceinte'],
    'Téléphones & Tablettes': ['telephone', 'phone', 'smartphone', 'tablette', 'tablet', 'itel', 'samsung', 'iphone', 'tecno', 'accessoires telephone'],
    'Informatique': ['ordinateur', 'laptop', 'pc', 'informatique', 'souris', 'clavier', 'computer', 'ecran', 'imprimante', 'scanner'],
    'Maison & Cuisine': ['maison', 'cuisine', 'meuble', 'decoration', 'deco', 'four', 'frigo', 'home', 'mobilier', 'electromenager', 'lit', 'table', 'chaise'],
    'Beauté & Soins': ['beaute', 'soin', 'parfum', 'maquillage', 'cosmetique', 'beauty', 'coiffure', 'cheveux', 'savon', 'creme'],
    'Santé & Bien-être': ['sante', 'bien-etre', 'medical', 'health', 'pharmacie', 'vitamine', 'massage'],
    'Livres & Papeterie': ['livre', 'bouquin', 'roman', 'papeterie', 'stylo', 'cahier', 'book', 'lecture'],
    'Jouets & Jeux': ['jouet', 'jeu', 'toy', 'game', 'enfant', 'bebe', 'baby', 'peluche', 'puzzle'],
    'Sport & Loisirs': ['sport', 'fitness', 'loisir', 'gym', 'musculation', 'velo', 'football', 'yoga'],
    'Auto & Moto': ['auto', 'moto', 'voiture', 'vehicule', 'car', 'automobile', 'piece detachee'],
    'Alimentation & Boissons': ['alimentation', 'boisson', 'epicerie', 'nourriture', 'food', 'drink', 'cafe', 'the', 'biscuit'],
    'Art & Artisanat': ['art', 'artisanat', 'peinture', 'sculpture', 'fait main', 'tableau'],
    'E-books & Documents': ['e-book', 'ebook', 'document', 'pdf', 'livre numerique'],
    'Logiciels & Applications': ['logiciel', 'application', 'software', 'app'],
    'Formations & Cours en ligne': ['formation', 'cours', 'coaching', 'learning', 'e-learning', 'webinar'],
    'Musique & Audio': ['musique', 'audio', 'son', 'instrument', 'mp3'],
    'Vidéos & Films': ['video', 'film', 'serie', 'documentaire', 'court metrage'],
    'Modèles & Templates (CV, Design, etc.)': ['modele', 'template', 'cv', 'design', 'presentation', 'kit graphique'],
    'Photographies & Art Digital': ['photographie', 'photo', 'image', 'art digital', 'illustration', 'nft'],
    'Services en ligne (Coaching, Consulting)': ['service', 'prestation', 'consulting', 'conseil', 'accompagnement'],
    'Jeux Vidéo & Contenu In-Game': ['jeu video', 'gaming', 'in-game', 'skin', 'credit jeu'],
    'Billetterie & Événements': ['billet', 'ticket', 'evenement', 'concert', 'spectacle'],
    'Autres (Physique)': ['autre'],
    'Autres (Digital)': ['autre']
  };

  const categoriesToIgnore = [
    'la solution complete pour la vente en ligne en afrique',
    'lancez-vous en 3 etapes simples'
  ];

  const normalizedCategories = categories.map(cat => ({
    original: cat,
    normalized: cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/s$/, '')
  })).filter(cat => cat.original && !categoriesToIgnore.includes(cat.normalized));

  const grouped = {};

  normalizedCategories.forEach(cat => {
    let foundGroup = false;
    for (const [harmonizedName, keywords] of Object.entries(categoryMapping)) {
      if (keywords.some(keyword => cat.normalized.includes(keyword))) {
        if (!grouped[harmonizedName]) {
          grouped[harmonizedName] = new Set();
        }
        grouped[harmonizedName].add(cat.original);
        foundGroup = true;
        break; 
      }
    }
    if (!foundGroup) {
      const defaultGroup = cat.normalized.includes('digital') ? 'Autres (Digital)' : 'Autres (Physique)';
      if (!grouped[defaultGroup]) {
        grouped[defaultGroup] = new Set();
      }
      grouped[defaultGroup].add(cat.original);
    }
  });

  return Object.entries(grouped).map(([name, originalCategoriesSet]) => ({
    name,
    originalCategories: Array.from(originalCategoriesSet)
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return Clock;
    case 'confirmed': return CheckCircle;
    case 'shipped': return Truck;
    case 'delivered': return PackageCheck;
    case 'cancelled': return XCircle;
    default: return AlertCircle;
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'text-yellow-500 bg-yellow-500/10';
    case 'confirmed': return 'text-blue-500 bg-blue-500/10';
    case 'shipped': return 'text-indigo-500 bg-indigo-500/10';
    case 'delivered': return 'text-green-500 bg-green-500/10';
    case 'cancelled': return 'text-red-500 bg-red-500/10';
    default: return 'text-gray-500 bg-gray-500/10';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'confirmed': return 'Confirmée';
    case 'shipped': return 'Expédiée';
    case 'delivered': return 'Livrée';
    case 'cancelled': return 'Annulée';
    default: return 'Inconnu';
  }
};
