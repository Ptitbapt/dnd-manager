// components/ui/ItemLink.jsx
"use client";

import { getAideDDUrl } from "../../lib/utils";

/**
 * Composant de lien vers la documentation AideDD pour un objet D&D
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.name - Le nom de l'objet
 * @param {string} [props.className] - Classes CSS supplémentaires pour le lien
 * @param {React.ReactNode} [props.children] - Contenu alternatif (si non fourni, le nom sera utilisé)
 */
export default function ItemLink({ name, className = "", children }) {
  return (
    <a
      href={getAideDDUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      className={`hover:text-indigo-600 hover:underline flex items-center ${className}`}
      title={`Voir sur AideDD: ${name}`}
    >
      {children || name}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3 ml-1 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
