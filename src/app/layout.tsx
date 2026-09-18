import type { Metadata } from 'next';
import { Caveat, Pixelify_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GuessWhat — How well do you know the world?',
  description:
    'The unified guessing platform. Test how well you know the world across Music, Movies, and Maps. Play Guess the Banger, guess songs, films, and places!',
  keywords: ['GuessWhat', 'trivia', 'guessing game', 'music quiz', 'Guess the Banger', 'movies quiz', 'maps quiz', 'daily challenge'],
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
    <html lang="en" className={`dark ${caveat.variable} ${pixelify.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#06080d] text-slate-100 antialiased selection:bg-sky-500/30 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
