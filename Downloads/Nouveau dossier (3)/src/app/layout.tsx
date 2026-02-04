import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prime Studio - Campagne Kinshasa Gombé",
  description: "Prime Studio - Séances photos professionnelles spécialisées",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#c71585" />
      </head>
      <body className="bg-gradient-to-br from-gray-900 via-red-900 to-gray-900">
        {children}
      </body>
    </html>
  );
}
