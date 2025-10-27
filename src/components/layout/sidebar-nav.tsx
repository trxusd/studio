'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import {
  LayoutDashboard,
  BarChart2,
  Crown,
  MessageSquare,
  CreditCard,
  Settings,
  Shield,
  LifeBuoy,
  Footprints,
} from 'lucide-react';
import { UserNav } from './user-nav';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/matches', icon: Footprints, label: 'Matches' },
  { href: '/predictions', icon: BarChart2, label: 'Old Predictions' },
  { href: '/vip-predictions', icon: Crown, label: 'VIP' },
  { href: '/community', icon: MessageSquare, label: 'Community' },
  { href: '/payments', icon: CreditCard, label: 'Payments' },
];

const secondaryNavItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/admin/dashboard', icon: Shield, label: 'Admin' },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <AppLogo className="size-8 text-primary" />
          <span className="font-headline text-xl font-semibold text-sidebar-foreground">
            FOOTBET-WIN
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {secondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarSeparator />
          <div className="p-2 group-data-[collapsible=icon]:hidden">
              <UserNav />
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
