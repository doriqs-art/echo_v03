import type { Metadata } from 'next';
import { Montserrat_Alternates, Sora, Syncopate, Michroma, Orbitron } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Cursor from '@/components/Cursor';
import SoundFx from '@/components/SoundFx';
import NoiseOverlay from '@/components/NoiseOverlay';

const montserratAlternates = Montserrat_Alternates({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

const syncopate = Syncopate({
  variable: '--font-syncopate',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const michroma = Michroma({
  variable: '--font-michroma',
  subsets: ['latin'],
  weight: ['400'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'ECHO',
  description: 'ECHO — recall a memory.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserratAlternates.variable} ${sora.variable} ${syncopate.variable} ${michroma.variable} ${orbitron.variable} antialiased`}
    >
      <body className="bg-ink text-bone">
        <NoiseOverlay />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll />
        <Cursor />
        <SoundFx />
        {children}
      </body>
    </html>
  );
}
