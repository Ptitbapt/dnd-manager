// src/app/components/shops/RaritySelector.jsx

import { useState } from "react";

export default function RaritySelector({
  rarities,
  shopConfig,
  onRarityChange,
  onRandomize,
  onClearAllRarities, // Nouvelle prop spécifique pour effacer les raretés
}) {
  const [expanded, setExpanded] = useState(true);

  // Vérifier si rarities est un tableau
  if (!Array.isArray(rarities)) {
    console.error("Les raretés ne sont pas un tableau:", rarities);
    rarities = [];
  }

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium text-gray-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Nombre d'objets par rareté
        </h3>

        <div className="flex items-center space-x-2">
          {/* Bouton Effacer tout - spécifique aux raretés */}
          <button
            type="button"
            onClick={onClearAllRarities}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Effacer
          </button>

          {/* Bouton Aléatoire */}
          <button
            type="button"
            onClick={onRandomize}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Aléatoire
          </button>

          {/* Bouton Replier/Déplier */}
          <button
            type="button"
            onClick={toggleExpand}
            className="text-gray-400 hover:text-gray-500"
          >
            {expanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-3">
        Définissez le nombre d'objets par niveau de rareté à inclure dans la
        boutique.
      </p>

      {expanded && (
        <div className="space-y-4">
          {rarities.map((rarity) => {
            const value = shopConfig.itemsPerRarity[rarity] || 0;
            return (
              <div key={rarity} className="flex items-center">
                <label
                  htmlFor={`rarity-${rarity}`}
                  className="block text-sm font-medium text-gray-700 mr-2 w-44 truncate"
                  title={rarity}
                >
                  {rarity}
                </label>
                <input
                  type="number"
                  id={`rarity-${rarity}`}
                  min="0"
                  value={value}
                  onChange={(e) => onRarityChange(rarity, e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
