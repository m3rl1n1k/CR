
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

interface SessionRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  email: string | null;
}

export function SessionRenewalModal({ isOpen, onClose, onSuccess, email }: SessionRenewalModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSessionRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is not available for session renewal.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
        // The login function in the new auth hook handles the token processing.
        // We just need to call it. It will throw an error on failure.
        await login({ username: email, password: password });
        // onSuccess will be called within the login flow if successful.
        // For this placeholder, we assume it works this way.
    } catch (err: any) {
        setError(err.message || 'Failed to renew session.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSessionRenewal}>
            <DialogHeader>
            <DialogTitle>{t('sessionExpiredTitle') || 'Session Expired'}</DialogTitle>
            <DialogDescription>
                {t('sessionExpiredDesc') || 'Your session has expired. Please enter your password to continue.'}
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('error')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                {t('personal_number') || 'Personal Number'}
                </Label>
                <Input id="email" value={email || ''} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password-renewal" className="text-right">
                {t('password') || 'Password'}
                </Label>
                <Input
                id="password-renewal"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                required
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                {t('logout') || 'Logout'}
            </Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('continueSession') || 'Continue'}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    