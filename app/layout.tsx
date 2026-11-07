import React from 'react';
import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import '../styles/Tailwind.css';
import '../styles/Wendigo.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#22c55e', // Color verde de la barra del navegador
};

export const metadata: Metadata = {
  title: 'WendigoSecurity — Control de accesos para condominios',
  description:
    'Plataforma multi-condominio para administrar accesos, visitas con QR, guardias, incidencias y alertas de pánico desde un solo sistema.',
  manifest: '/manifest.json', // Conecta el manifest de la PWA
  icons: {
    icon: '/favicon.png',     // Tu logo guardado en public/
    apple: '/favicon.png',    // Para que en iPhone se vea bien
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className={ibmPlexSans.className}>
        {children}

        {/* 
          Scripts de Rocket.new desactivados temporalmente para diagnóstico.
          Si la página carga bien sin ellos, ya sabemos que eran los culpables.

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fwendigosec7545back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.21" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.3" />
        */}
      </body>
    </html>
  );
}