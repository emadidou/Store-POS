import {
  Apple,
  Carrot,
  Clock3,
  HeartHandshake,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Salad,
  ShoppingBag,
  ShoppingBasket,
  Sprout,
  Star,
} from 'lucide-react';

export const navItems = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Produits', href: '#produits' },
  { label: 'Comment ça marche', href: '#comment-ca-marche' },
  { label: 'Commander', href: '/produits' },
  { label: 'À propos', href: '#a-propos' },
  { label: 'Contact', href: '#contact' },
];

export const categories = [
  {
    title: 'Fruits',
    count: '32 produits',
    description: 'Agrumes, fruits rouges, pommes et fruits de saison.',
    image:
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80',
    Icon: Apple,
  },
  {
    title: 'Légumes',
    count: '41 produits',
    description: 'Légumes croquants récoltés au bon moment.',
    image:
      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=900&q=80',
    Icon: Carrot,
  },
  {
    title: 'Produits bio',
    count: '26 produits',
    description: 'Sélection certifiée, traçable et naturellement savoureuse.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    Icon: Sprout,
  },
  {
    title: 'Herbes aromatiques',
    count: '12 bottes',
    description: 'Menthe, basilic et herbes fraîches ajoutées au dernier moment.',
    image:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    Icon: Salad,
  },
  {
    title: 'Paniers du jour',
    count: '8 formules',
    description: 'Compositions prêtes à récupérer, ajustées selon les arrivages.',
    image:
      'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80',
    Icon: ShoppingBasket,
  },
];

export const products = [
  {
    name: 'Fraises gariguette',
    category: 'Fruits',
    price: '4,90 EUR/kg',
    badge: 'Du jour',
    image:
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Tomates anciennes',
    category: 'Légumes',
    price: '3,80 EUR/kg',
    badge: 'Local',
    image:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Panier bio famille',
    category: 'Bio',
    price: '18,50 EUR/kg',
    badge: 'Bio',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Avocats Hass',
    category: 'Fruits',
    price: '2,40 EUR/kg',
    badge: 'Mûr',
    image:
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Herbes aromatiques',
    category: 'Herbes',
    price: '1,90 EUR/kg',
    badge: 'Frais',
    image:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Jus orange carotte',
    category: 'Jus frais',
    price: '5,20 EUR/kg',
    badge: 'Pressé',
    image:
      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Pommes gala',
    category: 'Fruits',
    price: '2,90 EUR/kg',
    badge: 'Local',
    image:
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Citrons jaunes',
    category: 'Fruits',
    price: '3,20 EUR/kg',
    badge: 'Frais',
    image:
      'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Bananes premium',
    category: 'Fruits',
    price: '2,60 EUR/kg',
    badge: 'Mûr',
    image:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Raisins blancs',
    category: 'Fruits',
    price: '4,40 EUR/kg',
    badge: 'Du jour',
    image:
      'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Carottes fanes',
    category: 'Légumes',
    price: '2,30 EUR/kg',
    badge: 'Local',
    image:
      'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Courgettes vertes',
    category: 'Légumes',
    price: '2,80 EUR/kg',
    badge: 'Frais',
    image:
      'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Poivrons colorés',
    category: 'Légumes',
    price: '3,70 EUR/kg',
    badge: 'Du jour',
    image:
      'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Champignons bruns',
    category: 'Légumes',
    price: '3,90 EUR/kg',
    badge: 'Frais',
    image:
      'https://images.unsplash.com/photo-1504545102780-26774c1bb073?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Salade romaine',
    category: 'Légumes',
    price: '1,80 EUR/kg',
    badge: 'Local',
    image:
      'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Oignons rouges',
    category: 'Légumes',
    price: '2,10 EUR/kg',
    badge: 'Frais',
    image:
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Pommes de terre nouvelles',
    category: 'Légumes',
    price: '2,50 EUR/kg',
    badge: 'Local',
    image:
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Concombres croquants',
    category: 'Légumes',
    price: '1,60 EUR/kg',
    badge: 'Du jour',
    image:
      'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Panier bio solo',
    category: 'Bio',
    price: '11,90 EUR/kg',
    badge: 'Bio',
    image:
      'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Oeufs fermiers bio',
    category: 'Bio',
    price: '4,20 EUR/kg',
    badge: 'Bio',
    image:
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Menthe fraîche',
    category: 'Herbes',
    price: '1,40 EUR/kg',
    badge: 'Frais',
    image:
      'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Basilic en botte',
    category: 'Herbes',
    price: '1,70 EUR/kg',
    badge: 'Local',
    image:
      'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Jus pomme gingembre',
    category: 'Jus frais',
    price: '5,60 EUR/kg',
    badge: 'Pressé',
    image:
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Smoothie vert',
    category: 'Jus frais',
    price: '6,20 EUR/kg',
    badge: 'Pressé',
    image:
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=700&q=80',
  },
];

export const testimonials = [
  {
    name: 'Camille R.',
    role: 'Commande après le travail',
    quote: 'Je commande avant de partir du bureau et tout est prêt quand j’arrive. Simple et très frais.',
    rating: 5,
  },
  {
    name: 'Nora B.',
    role: 'Restaurant de quartier',
    quote: 'Les produits sont sélectionnés avec soin et la récupération est rapide, même aux heures chargées.',
    rating: 5,
  },
  {
    name: 'Julien M.',
    role: 'Panier famille',
    quote: 'Le résumé de commande est clair, les quantités sont prêtes et je gagne un vrai temps chaque semaine.',
    rating: 5,
  },
];

export const contactItems = [
  { label: 'Adresse', value: '18 rue des Jardins, centre-ville', Icon: MapPin },
  { label: 'Téléphone', value: '+33 1 42 18 62 40', Icon: Phone },
  { label: 'Horaires', value: 'Lun - Sam, 8h00 - 19h30', Icon: Clock3 },
  { label: 'Retrait', value: 'Commandes préparées selon l’heure indiquée', Icon: PackageCheck },
];

export const footerLinks = [
  'Produits frais',
  'Paniers bio',
  'À propos',
  'Contact',
];

export const utilityIcons = {
  HeartHandshake,
  MessageCircle,
  ShoppingBag,
  Star,
};
