import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'SongSprint — Fun Yellow Music Guessing Game',
  description:
    'Listen to sub-second audio snippets, guess the song, maintain your streak, and challenge your musical ear. Fast-paced, playful, and fun!',
  keywords: ['music quiz', 'song guessing game', 'daily challenge', 'unlimited music game', 'song recognition'],
  icons: {
    icon: '/brand/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FFFDF0] text-slate-900 antialiased selection:bg-amber-300 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
