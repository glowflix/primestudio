import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import BottomNavigation from "@/components/BottomNavigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prime Studio - Photographie Professionnelle Kinshasa",
  description: "Prime Studio - Séances photos professionnelles pour portraits, branding, et contenu créatif. Services de photographie premium à Kinshasa.",
  keywords: ["photographie", "kinshasa", "portraits", "branding", "séance photo"],
  openGraph: {
    title: "Prime Studio - Photographie Professionnelle",
    description: "Découvrez nos services de photographie premium à Kinshasa. Portraits, branding, contenu social.",
    url: "https://prime-studio.vercel.app",
    siteName: "Prime Studio",
    images: [
      {
        url: "/images/267A1009.webp",
        width: 800,
        height: 600,
        alt: "Prime Studio - Séance Portrait",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime Studio - Photographie Professionnelle",
    description: "Photographie professionnelle à Kinshasa",
    images: ["/images/267A1009.webp"],
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
        <meta name="theme-color" content="#000000" />        {/* Preload critical images */}
        <link rel="preload" as="image" href="/images/267A1009.webp" />
        <link rel="preload" as="image" href="/images/267A1031.webp" />
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://wa.me" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />      </head>
      <body className="bg-black text-white">
        <Navigation />
        <BottomNavigation />
        <main className="pt-0 md:pt-20">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black border-t border-white/10 mt-20 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                  PRIME STUDIO
                </h3>
                <p className="text-gray-400">Créateur d'images professionnelles à Kinshasa</p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Liens Rapides</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/" className="hover:text-white transition">Accueil</a></li>
                  <li><a href="/store" className="hover:text-white transition">Galerie</a></li>
                  <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <p className="text-gray-400">+243 895 438 484</p>
                <p className="text-gray-400">Kinshasa, Gombé</p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
              <p>© 2026 Prime Studio. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
