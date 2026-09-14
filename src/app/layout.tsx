import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'SongSprint — The Fast-Paced Song Recognition Game',
  description:
    'Play the daily song-recognition sprint, practice unlimited rounds, and challenge friends with short audio clues. Server-verified, spoiler-safe, and lawful music previews.',
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
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
