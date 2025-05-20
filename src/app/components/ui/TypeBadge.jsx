// components/ui/TypeBadge.jsx
"use client";

import { getTypeColor } from "../../lib/utils";

/**
 * Composant d'affichage du type d'objet avec indicateur coloré
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.type - Le type principal de l'objet
 * @param {string} [props.subtype] - Le sous-type de l'objet (optionnel)
 * @param {string} [props.className] - Classes CSS supplémentaires
 */
export default function TypeBadge({ type, subtype, className = "" }) {
  const colorClass = getTypeColor(type);

  return (
    <div className={`flex items-center ${className}`}>
      <span
        className={`inline-flex items-center justify-center w-3 h-3 rounded-full mr-2 ${colorClass}`}
      ></span>
      {type} {subtype ? `(${subtype})` : ""}
    </div>
  );
}
