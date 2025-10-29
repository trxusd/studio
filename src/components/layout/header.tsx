
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AppLogo } from '../icons';

export function Header() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  // Don't show header on matches page for a cleaner look
  if (pathname === '/matches') {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:h-16 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold md:hidden">
            <AppLogo className="h-6 w-6 text-primary" />
            <span className="font-headline">FOOTBET-WIN</span>
        </Link>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="font-semibold text-foreground">Home</Link>
          {pathSegments.map((segment, index) => {
             const href = '/' + pathSegments.slice(0, index + 1).join('/');
             const isLast = index === pathSegments.length - 1;
             
             // Do not show a link for dynamic routes that are not category pages
             const isDynamicId = /\[.*\]/.test(segment);
             const isCouponRoute = pathSegments[index - 1] === 'predictions' && pathSegments[index] === 'coupon';
             const isMatchRoute = pathSegments[index - 1] === 'app' && pathSegments[index] === 'match';

             if (isDynamicId || segment === 'app' || segment === 'predictions' || isCouponRoute || isMatchRoute) return null;


             return (
                 <span key={segment} className="flex items-center gap-2">
                    <span>/</span>
                    <Link href={href} className={cn(isLast ? "text-foreground font-semibold" : "hover:text-foreground")}>
                        {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
                    </Link>
                 </span>
             )
          })}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Select defaultValue="en">
          <SelectTrigger className="w-28 h-9 text-xs">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="ht">Kreyòl</SelectItem>
          </SelectContent>
        </Select>
        <div className="hidden group-data-[collapsible=icon]:block">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
