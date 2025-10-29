
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
  Users,
  LineChart,
  Scale,
  Send,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { AppLogo } from './icons';

const menuItems = [
  { href: '/matches', icon: LifeBuoy, label: 'MATCH' },
  { href: '/guide', icon: BookOpen, label: 'GID' }, // Assuming GID means Guide
  { href: '/predictions', icon: BarChart2, label: 'PREDIKSYON' },
  { href: '/announcements', icon: Megaphone, label: 'ANONS' },
  { href: '/statistics', icon: LineChart, label: 'ESTATISTIK' },
  { href: '/referral', icon: Gift, label: 'PARENAJ' },
  { href: '/community', icon: Users, label: 'KOMINOTE' },
  { href: '/vip-predictions', icon: Crown, label: 'VIP' },
  { href: '#', icon: Headset, label: 'SIPO', isSheetTrigger: true },
  { href: '/settings', icon: Settings, label: 'PARAMET' },
  { href: '/legal', icon: Scale, label: 'LEGAL' },
  { href: '/admin/dashboard', icon: Shield, label: 'ADMIN', adminOnly: true },
];

const socialItems = [
    { href: '#', icon: Send, label: 'Telegram' },
    { href: '#', icon: Facebook, label: 'Facebook' },
    { href: '#', icon: Twitter, label: 'Twitter (X)' },
    { href: '#', icon: Instagram, label: 'Instagram' },
];

export function NavMenu() {
    const { user } = useUser();
    const adminEmails = ['trxusdt87@gmail.com', 'footbetwin2025@gmail.com'];
    const isUserAdmin = user?.email ? adminEmails.includes(user.email) : false;

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {menuItems.map((item) => {
             if (item.adminOnly && !isUserAdmin) {
                return null;
            }
            return (
              <Button
                key={item.label}
                variant="ghost"
                className="flex flex-col items-center justify-center h-28 gap-2 text-center bg-card rounded-lg shadow-md hover:bg-accent transition-all"
                asChild
              >
                <Link href={item.href}>
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
        
        <div className="text-center space-y-4">
            <h3 className="font-headline text-2xl font-bold tracking-tight">Follow Us</h3>
            <div className="flex justify-center gap-4">
                 {socialItems.map(item => (
                    <Button key={item.label} variant="outline" size="icon" className="h-14 w-14 rounded-full" asChild>
                        <Link href={item.href}>
                            <item.icon className="h-6 w-6" />
                        </Link>
                    </Button>
                ))}
                 <Button variant="outline" size="icon" className="h-14 w-14 rounded-full font-bold text-lg" asChild>
                    <Link href="#">
                        1x
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  );
}
