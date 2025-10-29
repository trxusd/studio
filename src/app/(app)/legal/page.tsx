
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scale } from 'lucide-react';
import Link from 'next/link';

const legalContent = {
  fr: {
    tos: {
      title: 'Conditions Générales d’Utilisation',
      sections: [
        {
          title: '1. Accès et Utilisation',
          content:
            'L’application FOOTBET-WIN est réservée aux utilisateurs ayant l’âge légal dans leur pays (minimum 18 ans). Utilisation uniquement à des fins personnelles, interdiction de revendre ou redistribuer les prédictions.',
        },
        {
          title: '2. Abonnements et Paiements',
          content:
            'Les abonnements VIP ne sont pas remboursables, sauf en cas d’erreur technique provenant de FOOTBET-WIN. Moyens de paiement acceptés : MonCash, NatCash, Crypto, Carte Visa.',
        },
        {
          title: '3. Interdictions',
          content:
            'Interdit d’utiliser l’application pour fraude, spam ou manipulation.',
        },
        {
          title: '4. Limitation de Responsabilité',
          content:
            'FOOTBET-WIN ne garantit aucun gain et n’est pas responsable des pertes financières.',
        },
        {
          title: '5. Résolution des Litiges',
          content:
            'Tout litige sera traité dans la juridiction d’enregistrement de l’entreprise.',
        },
      ],
    },
    privacy: {
      title: 'Politique de Confidentialité',
      sections: [
        {
          title: 'Données Collectées',
          content: 'Nom, e-mail, ID appareil, préférences de langue.',
        },
        {
          title: 'Utilisation des Données',
          content:
            'Amélioration du service, envoi de notifications, gestion des abonnements.',
        },
        {
          title: 'Sécurité',
          content: 'Données stockées sur Firebase avec protection avancée.',
        },
        {
          title: 'Droits Utilisateurs',
          content: 'Suppression ou accès aux données sur demande.',
        },
      ],
    },
    disclaimer: {
      title: 'Avis de non-responsabilité',
      content:
        'FOOTBET-WIN fournit des prédictions basées sur les statistiques et la forme des équipes. Aucun résultat n’est garanti à 100 %. L’utilisation est interdite dans les pays où les paris sportifs sont illégaux.',
    },
  },
  ht: {
    tos: {
      title: 'Kondisyon Itilizasyon',
      sections: [
        {
          title: '1. Aksè ak Itilizasyon',
          content:
            'FOOTBET-WIN rezève pou itilizatè ki gen laj legal nan peyi yo (omwen 18 an). Itilizasyon sèlman pou rezon pèsonèl, entèdi revann oswa redistribye prediksyon yo.',
        },
        {
          title: '2. Abònman ak Peman',
          content:
            'Abònman VIP yo pa ranbousab, sòf si gen erè teknik bò kote FOOTBET-WIN. Mwayen peman aksepte: MonCash, NatCash, Crypto, Kat Visa.',
        },
        {
          title: '3. Entèdiksyon',
          content:
            'Entèdi itilize aplikasyon an pou fwod, spam, oswa manipilasyon.',
        },
        {
          title: '4. Limit Responsablite',
          content:
            'FOOTBET-WIN pa garanti okenn benefis epi li pa responsab pou pèt finansye.',
        },
        {
          title: '5. Rezolisyon Konfli',
          content:
            'Tout konfli ap jere nan jiridiksyon kote konpayi an anrejistre.',
        },
      ],
    },
    privacy: {
      title: 'Politik Konfidansyalite',
      sections: [
        {
          title: 'Done Nou Kolekte',
          content: 'Non, imèl, ID aparèy, preferans lang.',
        },
        {
          title: 'Itilizasyon Done yo',
          content: 'Amelyore sèvis, voye notifikasyon, jere abònman.',
        },
        {
          title: 'Sekirite',
          content: 'Done yo estoke sou Firebase ak pwoteksyon avanse.',
        },
        {
          title: 'Dwa Itilizatè yo',
          content: 'Efase oswa jwenn aksè nan done yo sou demann.',
        },
      ],
    },
    disclaimer: {
      title: 'Avètisman',
      content:
        'FOOTBET-WIN bay prediksyon ki baze sou estatistik ak fòm ekip yo. Pa gen okenn rezilta ki garanti a 100% . Itilizasyon an entèdi nan peyi kote parayj espò yo ilegal.',
    },
  },
  en: {
    tos: {
      title: 'Terms of Service',
      sections: [
        {
          title: '1. Access and Use',
          content:
            'FOOTBET-WIN is for users of legal age in their country (minimum 18 years old). Use is for personal purposes only; resale or redistribution of predictions is prohibited.',
        },
        {
          title: '2. Subscriptions and Payments',
          content:
            'VIP subscriptions are non-refundable, except in case of technical errors from FOOTBET-WIN. Accepted payment methods: MonCash, NatCash, Crypto, Visa Card.',
        },
        {
          title: '3. Prohibited Uses',
          content: 'No fraud, spam, or market manipulation.',
        },
        {
          title: '4. Limitation of Liability',
          content:
            'FOOTBET-WIN does not guarantee winnings and is not responsible for financial losses.',
        },
        {
          title: '5. Dispute Resolution',
          content:
            'All disputes will be handled under the jurisdiction where the company is registered.',
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      sections: [
        {
          title: 'Data Collected',
          content: 'Name, email, device ID, language preferences.',
        },
        {
          title: 'Data Use',
          content: 'Improve service, send notifications, manage subscriptions.',
        },
        {
          title: 'Security',
          content: 'Data stored on Firebase with advanced protection.',
        },
        {
          title: 'User Rights',
          content: 'Request deletion or access to data.',
        },
      ],
    },
    disclaimer: {
      title: 'Disclaimer',
      content:
        'FOOTBET-WIN provides predictions based on team statistics and form. No result is guaranteed at 100%. Use is prohibited in countries where sports betting is illegal.',
    },
  },
};

function LegalSection({ lang }: { lang: 'fr' | 'ht' | 'en' }) {
  const content = legalContent[lang];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{content.tos.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {content.tos.sections.map((section, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{section.title}</AccordionTrigger>
                <AccordionContent>{section.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{content.privacy.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {content.privacy.sections.map((section, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{section.title}</AccordionTrigger>
                <AccordionContent>{section.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{content.disclaimer.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{content.disclaimer.content}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LegalPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="md:hidden">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <h2 className="font-headline text-3xl font-bold tracking-tight">Legal Documents</h2>
        </div>
      </div>
       <p className="text-muted-foreground">
          Terms of Service, Privacy Policy, and Disclaimers for FOOTBET-WIN.
        </p>

      <Tabs defaultValue="en" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="fr">Français</TabsTrigger>
          <TabsTrigger value="ht">Kreyòl Ayisyen</TabsTrigger>
        </TabsList>
        <TabsContent value="en" className="mt-4">
          <LegalSection lang="en" />
        </TabsContent>
        <TabsContent value="fr" className="mt-4">
          <LegalSection lang="fr" />
        </TabsContent>
        <TabsContent value="ht" className="mt-4">
          <LegalSection lang="ht" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
