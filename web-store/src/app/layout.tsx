import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { StoreLayoutShell } from './StoreLayoutShell';

export const metadata: Metadata = {
  title: 'Imora Store — Do‘kon Boshqaruv Paneli',
  description: 'Imora arxitektura va ta‘mir mahsulotlari do‘kon paneli (Otabek)',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" className="dark">
      <body className="bg-stone-950 text-stone-100 antialiased min-h-screen">
        <StoreLayoutShell>{children}</StoreLayoutShell>
      </body>
    </html>
  );
}
