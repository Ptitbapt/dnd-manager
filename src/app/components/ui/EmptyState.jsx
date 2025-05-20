// components/ui/EmptyState.jsx
"use client";

import Link from "next/link";

/**
 * Composant d'affichage d'un état vide avec message et action optionnelle
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.message - Le message à afficher
 * @param {React.ReactNode} [props.icon] - Icône à afficher (SVG)
 * @param {string} [props.actionLink] - Lien de l'action
 * @param {string} [props.actionText] - Texte du bouton d'action
 * @param {string} [props.className] - Classes CSS supplémentaires
 */
export default function EmptyState({
  message,
  icon,
  actionLink,
  actionText,
  className = "",
}) {
  // Icône par défaut si aucune n'est fournie
  const defaultIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 mx-auto text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <div className={`text-center p-8 ${className}`}>
      <div className="mb-4">{icon || defaultIcon}</div>
      <p className="text-gray-600 mb-4">{message}</p>
      {actionLink && actionText && (
        <Link
          href={actionLink}
          className="inline-flex items-center text-sm px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          {actionText}
        </Link>
      )}
    </div>
  );
}
