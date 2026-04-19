"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <div className="w-full">
        {children}
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <header>
          <SidebarTrigger className="-ml-1" />
          <div className="p-4 flex-1">
            {children}
            <Toaster />
          </div>
        </header>
      </main>
    </SidebarProvider>
  );
}
