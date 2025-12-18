import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Linear Kanban',
  description: 'High-performance task management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.className} bg-[#0B0D11] text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}