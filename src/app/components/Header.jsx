"use client";
// components/Header.jsx
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState("fr"); // 'fr' par défaut

  // Fonction pour changer de langue
  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "en" : "fr");
    // Ici, on pourrait également déclencher un changement global de langue dans l'application
  };

  return (
    <header className="bg-gray-900 shadow-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-purple-500">
                Générateur de Boutiques D&D
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/items"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-white border-b-2 border-transparent hover:border-purple-500"
              >
                Objets
              </Link>
              <Link
                href="/shops/generate"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-white border-b-2 border-transparent hover:border-green-500"
              >
                Générer une Boutique
              </Link>
              <Link
                href="/shops"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-white border-b-2 border-transparent hover:border-blue-500"
              >
                Boutiques Sauvegardées
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Menu mobile */}
            <div className="sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-expanded="false"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Ouvrir le menu</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      mobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-gray-800">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/items"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 hover:border-purple-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Objets
            </Link>
            <Link
              href="/shops/generate"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 hover:border-green-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Générer une Boutique
            </Link>
            <Link
              href="/shops"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 hover:border-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Boutiques Sauvegardées
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
