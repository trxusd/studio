
'use client';
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Header } from "@/components/layout/header";
import { usePathname } from "next/navigation";
import { Chatbot } from "../chatbot";
import { Sheet } from "../ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname.startsWith('/login') || pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
        <Sheet>
            <div className="relative flex min-h-screen">
                <Sidebar>
                <SidebarNav />
                </Sidebar>
                <div className="flex-1 flex flex-col">
                    <Header />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
            <Chatbot />
        </Sheet>
    </SidebarProvider>
  );
}
