'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card';
import { Input } from "@/components/ui/input';
import { Label } from "@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { Icons } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock authentication
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: t('login_successful'),
                description: t('redirecting_to_dashboard'),
            });
            router.push('/');
        }, 1500);
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
                <Icons.logo className="size-12 text-primary" />
            </div>
          <CardTitle className="text-2xl">{t('welcome_back')}</CardTitle>
          <CardDescription>{t('login_to_continue')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personal-number">{t('personal_number')}</Label>
              <Input
                id="personal-number"
                type="text"
                placeholder="E.g., 123456"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('logging_in')}...
                </>
              ) : t('login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
