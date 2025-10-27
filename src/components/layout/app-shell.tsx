'use client';
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Header } from "@/components/layout/header";
import { Chatbot } from "@/components/chatbot";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Don't show app shell on login page
  if (pathname.startsWith('/login')) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="bg-background">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="min-h-[calc(100vh_-_4rem)]">
            {children}
          </main>
        </SidebarInset>
      </div>
      <Chatbot />
    </SidebarProvider>
  );
}
