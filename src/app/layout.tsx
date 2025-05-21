// src/app/layout.tsx
import "./globals.css";
import Header from "./Header";
import { initializeApp } from "./lib/initApp";

export const metadata = {
  title: "Générateur de Boutiques D&D",
  description:
    "Application pour gérer les objets et générer des boutiques aléatoires pour vos sessions de Donjons et Dragons",
};

initializeApp().catch((error) => {
  console.error("Erreur lors de l'initialisation de l'application:", error);
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">{children}</main>
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <span className="text-gray-600">
                  Générateur de Boutiques D&D
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Créé pour améliorer vos sessions de jeu •{" "}
                {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
