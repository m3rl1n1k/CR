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
    Globe,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';

const navItems = [
    { href: '/', labelKey: 'overview', icon: LayoutDashboard },
    { href: '/products', labelKey: 'products', icon: Package },
    { href: '/problems', labelKey: 'problems', icon: TriangleAlert },
];

function LanguageSwitcher() {
    const { setLanguage } = useTranslation();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Globe className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('pl')}>Polski</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('uk')}>Українська</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { t } = useTranslation();

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <Icons.logo className="size-8 text-primary" />
                        <span className="text-lg font-semibold">{t('title')}</span>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <Link href={item.href} passHref legacyBehavior>
                                    <SidebarMenuButton
                                        as="a"
                                        isActive={pathname === item.href}
                                        tooltip={t(item.labelKey)}
                                        className="justify-start"
                                    >
                                        <item.icon className="size-4" />
                                        <span>{t(item.labelKey)}</span>
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
                            <span className="text-xs text-muted-foreground">{t('supervisor')}</span>
                        </div>
                         <div className="ml-auto flex items-center gap-2">
                            <LanguageSwitcher />
                            <Button variant="ghost" size="icon">
                                <Settings className="size-4" />
                            </Button>
                        </div>
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
