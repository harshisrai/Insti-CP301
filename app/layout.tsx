import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

const dmSans = DM_Sans({ subsets: ["latin"], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'IIT Ropar Community Platform',
  description: 'Connect, collaborate, and celebrate the IIT Ropar community',
  generator: 'v0.app',
  applicationName: 'IIT Ropar Community Platform',
  keywords: ['IIT Ropar', 'community', 'students', 'events', 'marketplace', 'blogs'],
  authors: [{ name: 'IIT Ropar' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#f59e0b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme flash prevention script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const isDark = theme ? theme === 'dark' : prefersDark;
              if (isDark) document.documentElement.classList.add('dark');
            })();
          `,
        }} />
      </head>
      <body className={`${dmSans.variable} ${playfair.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
