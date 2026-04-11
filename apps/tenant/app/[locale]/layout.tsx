import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Geist, Geist_Mono, DM_Sans } from 'next/font/google';
import '../globals.css';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tenant App - Kaven',
  description: 'Manage your space and team.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

import { ThemeProvider } from '@/providers/theme-provider';
import { TooltipProvider } from '@kaven/ui-base';
import { prisma } from '@/lib/prisma';
import { generatePalette } from '@/utils/color';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 1. Fetch Platform Config (Server-side)
  let primaryColor = '#10B981'; // Default brandbook v2.0.1
  let faviconUrl = '/favicon.ico'; // Default fallback

  try {
    // ✅ AXISOR/KAVEN STYLE: Use Prisma ORM instead of raw query to handle case-sensitivity and schema mapping
    const config = await prisma.platformConfig.findFirst({
      select: {
        primaryColor: true,
        faviconUrl: true,
      }
    });

    if (config) {
      if (config.primaryColor) primaryColor = config.primaryColor;
      if (config.faviconUrl) faviconUrl = config.faviconUrl;
    }
  } catch (error) {
     console.error('[RootLayout] Failed to fetch PlatformConfig:', error);
  }

  // 2. Generate Palette
  const palette = generatePalette(primaryColor);

  // 3. Generate CSS
  const themeStyles = `
    :root {
      --primary: ${palette.main};
      --primary-foreground: ${palette.contrastText};
      --primary-lighter: ${palette.lighter};
      --primary-light: ${palette.light};
      --primary-main: ${palette.main};
      --primary-dark: ${palette.dark};
      --primary-darker: ${palette.darker};
      --sidebar-primary: ${palette.main};
      --sidebar-primary-foreground: ${palette.contrastText};
    }
  `;

  // 4. Fetch i18n messages
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning data-theme="dark" className="dark">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        <link rel="icon" href={faviconUrl} />
      </head>
      <body suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${dmSans.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <TooltipProvider delayDuration={200} skipDelayDuration={300}>
            <ThemeProvider defaultMode="dark">
             {children}
            </ThemeProvider>
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
