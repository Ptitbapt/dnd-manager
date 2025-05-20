// components/ui/RarityBadge.jsx
"use client";

import { getRarityClasses } from "../../lib/utils";

/**
 * Composant d'affichage de la rareté d'un objet avec style coloré
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.rarity - La rareté de l'objet
 * @param {string} [props.className] - Classes CSS supplémentaires
 */
export default function RarityBadge({ rarity, className = "" }) {
  const rarityClasses = getRarityClasses(rarity);

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${rarityClasses} ${className}`}
    >
      {rarity}
    </span>
  );
}
