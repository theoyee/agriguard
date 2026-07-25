import type { Metadata } from 'next';
import './globals.css'; // Global styles
import Header from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Plant disease detection sustem',
  description: 'Plant disease detection system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}</body>
    </html>
  );
}
