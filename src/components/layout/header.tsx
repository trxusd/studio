
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AppLogo } from '../icons';

export function Header() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  const isSpecialPage = pathname === '/matches' || pathname === '/community';

  if (isSpecialPage) {
    return null;
  }
  
  const breadcrumbs = pathSegments.length > 0 ? pathSegments : ['dashboard'];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:h-16 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
           <Link href="/dashboard" className="font-semibold text-foreground">Home</Link>
           {breadcrumbs.map((segment, index) => {
             const href = '/' + breadcrumbs.slice(0, index + 1).join('/');
             const isLast = index === breadcrumbs.length - 1;
             
             if (segment === 'app' || segment === 'dashboard' && index > 0) return null;
             if (index === 0 && segment === 'dashboard') return null;
             
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

      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold md:hidden">
          <AppLogo className="h-7 w-7 text-primary" />
        </Link>
      </div>

      <div className="flex items-center gap-4">
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
      </div>
    </header>
  );
}
