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
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const { login } = useAuth();
    const [personalNumber, setPersonalNumber] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login(personalNumber, password);
            toast({
                title: t('login_successful'),
                description: t('redirecting_to_dashboard'),
            });
            router.push('/');
        } catch (err) {
             setError(t('login_failed_error'));
             setIsLoading(false);
        }
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
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('error')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="personal-number">{t('personal_number')}</Label>
              <Input
                id="personal-number"
                type="text"
                placeholder="E.g., 123456"
                required
                value={personalNumber}
                onChange={(e) => setPersonalNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                />
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
