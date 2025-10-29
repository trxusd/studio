
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart2,
  LifeBuoy,
  Crown,
  MessageSquare,
  CreditCard,
  Gift,
  Shield,
  Settings,
  Headset,
  BookOpen,
  Megaphone,
  Mail,
} from 'lucide-react';
import { useUser } from '@/firebase';

const menuItems = [
  { href: '/predictions', icon: BarChart2, label: 'Prédictions' },
  { href: '/matches', icon: LifeBuoy, label: 'Match' },
  { href: '/vip-predictions', icon: Crown, label: 'VIP' },
  { href: '/community', icon: MessageSquare, label: 'Communaute' },
  { href: '/payments', icon: CreditCard, label: 'Paiement' },
  { href: '/referral', icon: Gift, label: 'Parrainage' },
  { href: '#', icon: Headset, label: 'Support', isSheetTrigger: true },
  { href: '#', icon: BookOpen, label: 'Règles' },
  { href: '/admin/dashboard', icon: Shield, label: 'Admin', adminOnly: true },
  { href: '/settings', icon: Settings, label: 'Paramètres' },
  { href: '#', icon: Megaphone, label: 'Annonces' },
  { href: '#', icon: Mail, label: 'Contactez-nous' },
];

export function NavMenu() {
    const { user } = useUser();
    const adminEmails = ['trxusdt87@gmail.com', 'footbetwin2025@gmail.com'];
    const isUserAdmin = user?.email ? adminEmails.includes(user.email) : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Toutes les fonctionnalités</CardTitle>
        <CardDescription>
          Naviguez facilement vers toutes les sections de l'application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {menuItems.map((item) => {
             if (item.adminOnly && !isUserAdmin) {
                return null;
            }
            return (
              <Button
                key={item.label}
                variant="outline"
                className="flex flex-col items-center justify-center h-24 gap-2 text-center"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-6 w-6 text-primary" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}
