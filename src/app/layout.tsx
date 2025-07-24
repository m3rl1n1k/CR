import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { TranslationProvider } from '@/hooks/use-translation';
import { AuthProvider } from '@/hooks/use-auth';
import { DebugProvider } from '@/hooks/use-debug';

export const metadata: Metadata = {
  title: 'Production Insights',
  description: 'AI-Powered Production Line Analysis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="C Reports" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <DebugProvider>
            <TranslationProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </TranslationProvider>
        </DebugProvider>
        <Toaster />
      </body>
    </html>
  );
}
