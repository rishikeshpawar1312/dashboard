import { Inter } from 'next/font/google';
import { NextAuthProvider } from '@/providers/auth';
import './globals.css';
import '@fontsource/inter';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          {children}</NextAuthProvider>
      </body>
    </html>
  );
}
 