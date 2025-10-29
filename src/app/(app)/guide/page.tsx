
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Download, UserPlus, Navigation, BarChart3, Ticket, Crown, Users, Settings, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';

const guideSections = [
    {
        icon: Info,
        title: "1. Introduction à FOOTBET-WIN",
        content: `FOOTBET-WIN est une application de pronostics sportifs spécialisée dans le football, alimentée par une intelligence artificielle (IA) de pointe. Notre mission est de vous fournir des analyses détaillées et des prédictions fiables pour vous aider à prendre des décisions éclairées dans vos paris.`
    },
    {
        icon: UserPlus,
        title: "2. Installation et Inscription",
        content: `
- **Téléchargement** : L'application est disponible sur notre site web officiel.
- **Création de compte** : Cliquez sur "S'inscrire", remplissez les champs requis (nom, email, mot de passe) et validez.
- **Connexion** : Utilisez votre email et mot de passe pour vous connecter à votre compte.`
    },
    {
        icon: Navigation,
        title: "3. Navigation Principale",
        content: `
- **Accueil** : Votre tableau de bord central avec un résumé des prédictions du jour et les actualités.
- **Matchs** : Explorez tous les matchs disponibles, filtrez par date, ligue ou pays.
- **Statistiques** : Visualisez les performances passées de nos prédictions (taux de réussite, victoires, pertes).
- **Prédictions** : Accédez aux catégories de prédictions gratuites et VIP.
- **Communauté** : Un espace de chat pour discuter avec d'autres utilisateurs et partager des analyses.
- **Support** : Contactez notre équipe d'assistance via le chatbot IA 24/7.`
    },
    {
        icon: BarChart3,
        title: "4. Système de Prédictions",
        content: `
- **Prédictions Gratuites vs. VIP** : Les prédictions VIP sont basées sur des analyses plus poussées et ont un niveau de confiance plus élevé.
- **Comment lire une prédiction** : Chaque prédiction inclut le match, le type de pari (ex: "Victoire Équipe A", "Plus de 2.5 buts"), la cote, et un indice de confiance.
- **Analyse détaillée** : Pour chaque match, nous fournissons des statistiques clés comme les confrontations directes (H2H), la forme récente, le classement et les performances à domicile/extérieur.`
    },
    {
        icon: Ticket,
        title: "5. Système de Coupons",
        content: `
- **Coupons Gratuits** : Disponibles dans la section "Prédictions", ils regroupent plusieurs matchs gratuits.
- **Coupons VIP** : Accessibles via un abonnement, ils offrent des cotes combinées plus élevées.
- **Utilisation** : Sélectionnez un coupon pour voir la liste des matchs. Les cotes totales sont calculées automatiquement.`
    },
    {
        icon: Crown,
        title: "6. Abonnements et Accès VIP",
        content: `
- **Avantages VIP** : Accès à des prédictions exclusives, des analyses plus profondes et des coupons à plus fort potentiel.
- **Modes de Paiement** : Nous acceptons MonCash, NatCash, et les crypto-monnaies (USDT).
- **Gestion** : Rendez-vous dans la section "Paiements" pour activer ou renouveler votre abonnement.`
    },
    {
        icon: Users,
        title: "7. Communauté et Support",
        content: `
- **Poser une question** : Utilisez le chat de la communauté pour interagir. Les administrateurs comme "TRX USDT" sont identifiés par un badge spécial.
- **Règles** : Le respect et la courtoisie sont obligatoires. Pas de spam, d'insultes ou de publicité.
- **Contacter le support** : Utilisez le chatbot IA disponible 24/7. Pour des problèmes spécifiques, il vous guidera vers un contact humain.`
    },
    {
        icon: Settings,
        title: "8. Paramètres et Langue",
        content: `
- **Changement de langue** : Allez dans "Paramètres" pour choisir entre Français, Anglais, et Créole Haïtien.
- **Notifications** : Gérez vos préférences de notification pour être alerté des nouveaux pronostics.
- **Thème** : Basculez entre le thème sombre et clair (si disponible).`
    },
    {
        icon: ShieldAlert,
        title: "9. Conseils de Paris Responsables",
        content: `
- **Gestion du risque** : Ne pariez jamais plus que ce que vous pouvez vous permettre de perdre.
- **Discipline** : Évitez de parier sous le coup de l'émotion. Suivez une stratégie claire.
- **Analyse** : Utilisez nos données comme un outil d'aide à la décision, mais faites aussi vos propres recherches.`
    },
    {
        icon: CheckCircle,
        title: "10. Conclusion",
        content: `FOOTBET-WIN est un outil puissant, mais il est important de rappeler que les paris sportifs comportent des risques. Aucun résultat n'est garanti à 100%. Nous encourageons un jeu responsable et maîtrisé.`
    }
];


export default function GuidePage() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="md:hidden">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="font-headline text-3xl font-bold tracking-tight">Guide Utilisateur</h2>
        </div>
      </div>
       <p className="text-muted-foreground">
          Apprenez à maîtriser toutes les fonctionnalités de FOOTBET-WIN.
        </p>
    
      <Accordion type="multiple" defaultValue={['1. Introduction à FOOTBET-WIN']} className="w-full space-y-2">
        {guideSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <AccordionItem value={section.title} key={index} className="border bg-card rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline text-left">
                <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert whitespace-pre-wrap">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  );
}
