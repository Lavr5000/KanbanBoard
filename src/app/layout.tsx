import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanban University",
  description: "Premium Kanban Board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
