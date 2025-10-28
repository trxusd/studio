
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
} from 'lucide-react';
import { UserNav } from './user-nav';
import { useUser } from '@/firebase';
import { useSidebar } from '@/components/ui/sidebar';
import { SheetTrigger } from '../ui/sheet';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/matches', icon: LifeBuoy, label: 'Matches' },
  { href: '/predictions', icon: BarChart2, label: 'Prédictions' },
  { href: '/vip-predictions', icon: Crown, label: 'VIP' },
  { href: '/community', icon: MessageSquare, label: 'Community' },
  { href: '/payments', icon: CreditCard, label: 'Payments' },
];

const secondaryNavItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/admin/dashboard', icon: Shield, label: 'Admin', adminOnly: true },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { setOpenMobile, isMobile } = useSidebar();
  const adminEmail = 'trxusdt87@gmail.com';

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

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
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} onClick={handleLinkClick}>
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
            <SidebarMenuItem>
                 <SheetTrigger asChild>
                    <SidebarMenuButton
                      tooltip={{ children: 'Support', side: 'right' }}
                      className="w-full"
                    >
                      <MessageSquare />
                      <span>Support</span>
                    </SidebarMenuButton>
                 </SheetTrigger>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {secondaryNavItems.map((item) => {
            if (item.adminOnly && user?.email !== adminEmail) {
                return null;
            }
            return (
                <SidebarMenuItem key={item.href}>
                <Link href={item.href} onClick={handleLinkClick}>
                    <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label, side: 'right' }}
                    >
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            );
          })}
          <SidebarSeparator />
          <div className="p-2 group-data-[collapsible=icon]:hidden">
              <UserNav />
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
