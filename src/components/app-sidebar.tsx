"use client";

import * as React from "react";
import {
  Calendar,
  Home,
  Users,
  Settings,
  LogOut,
  HeartPulse,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "", //"/dashboard"
    icon: Home,
  },
  {
    title: "Staff Management",
    url: "/staff",
    icon: Users,
  },
  {
    title: "Attendance",
    url: "/attendance",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "", //"/settings"
    icon: Settings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/attendance">
                {/* harusnya ini link ke dashboard atau halaman utama setelah login */}
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <HeartPulse className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-blue-600">
                    Rahayu Medika
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Management System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 dark:hover:bg-red-950/50"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
