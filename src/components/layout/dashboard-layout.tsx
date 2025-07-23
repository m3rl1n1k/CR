'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    Bot,
    TriangleAlert,
    Clock,
    Settings,
    LayoutDashboard,
    Package,
    Globe,
    LogOut,
    Bug,
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItemIndicator
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useDebug } from '@/hooks/use-debug';
import { Label } from '../ui/label';

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

function SettingsMenu() {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const router = useRouter();
    const { isDebug, toggleDebug } = useDebug();

    const handleLogout = () => {
        logout();
        router.push('/login');
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('settings')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                   <div className="flex items-center justify-between">
                     <Label htmlFor="debug-mode" className="flex items-center gap-2 font-normal cursor-pointer">
                        <Bug className="size-4" />
                        <span>{t('debug_mode')}</span>
                     </Label>
                     <Switch id="debug-mode" checked={isDebug} onCheckedChange={toggleDebug} />
                   </div>
                </div>
                 <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { t } = useTranslation();
    const { user } = useAuth();

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
                                <Link href={item.href}>
                                    <SidebarMenuButton
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
                            <AvatarImage src="https://placehold.co/100x100.png" alt={user?.name || 'User'} data-ai-hint="manager portrait" />
                            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{user?.name || 'User'}</span>
                            <span className="text-xs text-muted-foreground">{user?.role || t('supervisor')}</span>
                        </div>
                         <div className="ml-auto flex items-center gap-2">
                             <LanguageSwitcher />
                             <SettingsMenu />
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
