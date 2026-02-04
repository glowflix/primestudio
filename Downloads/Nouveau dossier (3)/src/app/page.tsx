'use client';

import QRCode from 'qrcode.react';
import { useRef } from 'react';

export default function Home() {
  const qrRef = useRef();

  const phoneNumber = "+243895438484";
  const whatsappMessage = "Bonjour! Je suis intéressé par les services de Prime Studio.";
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
  const currentPageUrl = typeof window !== 'undefined' ? window.location.href : 'https://prime-studio.vercel.app';

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement;
    const url = canvas?.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prime-studio-qr.png';
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">PRIME</h1>
          <p className="text-pink-500 text-lg font-italic mb-4">STUDIO</p>
          <div className="h-1 w-16 bg-gradient-to-r from-pink-600 to-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm">Campagne Promotionnelle Spéciale</p>
          <p className="text-gray-400 text-xs">Kinshasa - Gombé</p>
        </div>

        {/* Services List */}
        <div className="bg-black/40 backdrop-blur border border-pink-600/30 rounded-lg p-6 mb-8">
          <ul className="space-y-3">
            <li className="flex items-center text-gray-200">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
              Portraits Professionnels
            </li>
            <li className="flex items-center text-gray-200">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
              Photos Perso & Artistiques
            </li>
            <li className="flex items-center text-gray-200">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
              Branding, Réseaux Sociaux, DV
            </li>
            <li className="flex items-center text-gray-200">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
              Maquillage, Artistes
            </li>
            <li className="flex items-center text-gray-200">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
              Entrepreneurs
            </li>
          </ul>
        </div>

        {/* Contact Buttons */}
        <div className="space-y-3 mb-8">
          {/* WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.116-4.922 5.89-4.922 9.979 0 2.487.505 4.945 1.522 7.256l-1.628 5.686 5.858-1.588c2.391 1.243 5.024 1.9 7.661 1.9 9.444 0 17.134-7.529 17.134-16.986 0-4.549-1.747-8.75-4.923-11.92-3.176-3.171-7.432-4.926-11.667-4.926Z"/>
            </svg>
            WhatsApp: {phoneNumber}
          </a>

          {/* Call Button */}
          <a
            href={`tel:${phoneNumber}`}
            className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            Appel: {phoneNumber}
          </a>

          {/* Maps Button */}
          <a
            href="https://maps.google.com/?q=Kinshasa,Gombe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/>
            </svg>
            Localisation
          </a>

          {/* Website Button */}
          <a
            href="https://prime-studio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Visiter le Site
          </a>
        </div>

        {/* QR Code Section */}
        <div className="bg-black/40 backdrop-blur border border-pink-600/30 rounded-lg p-6 text-center">
          <p className="text-gray-300 text-sm mb-4">Scannez pour plus d&apos;informations</p>
          <div className="flex justify-center mb-4 bg-white p-4 rounded-lg" ref={qrRef}>
            <QRCode 
              value={currentPageUrl} 
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#c71585"
            />
          </div>
          <button
            onClick={downloadQR}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Télécharger QR Code
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-xs">
          <p>© 2026 Prime Studio - Kinshasa</p>
          <p>Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
}
