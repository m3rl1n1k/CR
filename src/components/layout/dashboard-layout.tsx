'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Bot,
    TriangleAlert,
    Clock,
    Settings,
    LayoutDashboard,
    Package,
} from 'lucide-react';
import {
    Sidebar,
    SidebarProvider,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarTrigger,
    SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/problems', label: 'Problems', icon: TriangleAlert },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isMobile = useIsMobile();

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <Icons.logo className="size-8 text-primary" />
                        <span className="text-lg font-semibold">Production Insights</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <Link href={item.href} legacyBehavior passHref>
                                    <SidebarMenuButton
                                        isActive={pathname === item.href}
                                        tooltip={item.label}
                                        className="justify-start"
                                    >
                                        <item.icon className="size-4" />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <Separator />
                <SidebarFooter>
                   <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="manager portrait" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">Jane Doe</span>
                            <span className="text-xs text-muted-foreground">Supervisor</span>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-auto">
                            <Settings className="size-4" />
                        </Button>
                   </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
                    <SidebarTrigger className="md:hidden"/>
                    <div className="w-full flex-1">
                        {/* Can add a search bar here later */}
                    </div>
                </header>
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}
