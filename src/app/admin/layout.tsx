
'use client';
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AppLogo } from "@/components/icons";
import { Home, Users, Ticket, LineChart, CheckCheck, Crown, Trophy, ArrowLeft, Bot, Loader2, UserCog, Megaphone } from "lucide-react";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const navItems = [
    { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/payment-verification", icon: CheckCheck, label: "Payment Verification" },
    { href: "/admin/vip-manager", icon: UserCog, label: "VIP Manager" },
    { href: "/admin/check-results", icon: Trophy, label: "Check Results" },
    { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
    { href: "/admin/official-predictions", icon: Bot, label: "Official Predictions" },
    { href: "/admin/analytics", icon: LineChart, label: "Analytics" },
];

const adminEmails = ['trxusdt87@gmail.com', 'footbetwin2025@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user || !user.email || !adminEmails.includes(user.email)) {
                router.replace('/dashboard');
            }
        }
    }, [user, loading, router]);

    if (loading || !user || !user.email || !adminEmails.includes(user.email)) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <AppLogo className="h-6 w-6 text-primary" />
                            <span className="font-headline">FOOTBET-WIN</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            {navItems.map(({ href, icon: Icon, label }) => (
                                <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                                    <Icon className="h-4 w-4" />
                                    {label}
                                 </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <div className="w-full flex-1">
                        {/* The back button was removed to avoid confusion with the main sidebar navigation */}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} />
                                    <AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard">Back to App</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}
