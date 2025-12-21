import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

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
    <html lang="ru" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-canvas text-text-primary antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
