import type { Metadata, Viewport } from "next";
import Navigation from "@/components/Navigation";
import BottomNavigation from "@/components/BottomNavigation";
import SplashScreen from "@/components/SplashScreen";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prime Studio - Photographie Professionnelle Kinshasa",
  description: "Prime Studio - Séances photos professionnelles pour portraits, branding, et contenu créatif. Services de photographie premium à Kinshasa.",
  keywords: ["photographie", "kinshasa", "portraits", "branding", "séance photo"],
  openGraph: {
    title: "Prime Studio - Photographie Professionnelle",
    description: "Découvrez nos services de photographie premium à Kinshasa. Portraits, branding, contenu social.",
    url: "https://primestudios.store",
    siteName: "Prime Studio",
    images: [
      {
        url: "/images/267A1009.webp",
        width: 1200,
        height: 630,
        alt: "Prime Studio - Séance Portrait",
        type: "image/webp",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
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
        {/* DNS Prefetch for faster resolution */}
        <link rel="dns-prefetch" href="https://wa.me" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
        {/* Favicon */}
        <link rel="icon" href="/icons/logo.ico" type="image/x-icon" />
        {/* Optimize for Core Web Vitals */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="bg-black text-white">
        <SplashScreen />
        <Navigation />
        <BottomNavigation />
        <main className="pt-0 md:pt-20">
          <PageTransition>
            {children}
          </PageTransition>
        </main>

        {/* Footer */}
        <footer className="bg-black border-t border-white/10 mt-20 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                  PRIME STUDIO
                </h3>
                <p className="text-gray-400">Créateur d&apos;images professionnelles à Kinshasa</p>
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
            {/* Legal Links */}
            <div className="border-t border-white/10 pt-8 mb-8">
              <div className="flex flex-col sm:flex-row justify-center gap-6 text-gray-400 text-sm mb-8">
                <a href="/privacy" className="hover:text-white transition">Politique de Confidentialité</a>
                <span className="hidden sm:inline text-white/20">•</span>
                <a href="/terms" className="hover:text-white transition">Conditions Générales</a>
              </div>
              <div className="text-center text-gray-400 text-sm">
                <p>© {new Date().getFullYear()} Prime Studio. Tous droits réservés.</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
