// src/app/components/shops/RaritySelector.jsx

import { useState } from "react";

export default function RaritySelector({
  rarities,
  shopConfig,
  onRarityChange,
  onRandomize,
  onClearAllRarities,
}) {
  const [expanded, setExpanded] = useState(true);

  // Vérifier si rarities est un tableau
  if (!Array.isArray(rarities)) {
    console.error("Les raretés ne sont pas un tableau:", rarities);
    rarities = [];
  }

  const handleRarityChange = (rarity, value) => {
    if (typeof onRarityChange === "function") {
      onRarityChange(rarity, value);
    } else {
      console.error("onRarityChange n'est pas une fonction");
    }
  };

  const handleRandomize = () => {
    if (typeof onRandomize === "function") {
      onRandomize();
    } else {
      console.error("onRandomize n'est pas une fonction");
    }
  };

  const handleClearAllRarities = () => {
    if (typeof onClearAllRarities === "function") {
      onClearAllRarities();
    } else {
      console.error("onClearAllRarities n'est pas une fonction");
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium text-gray-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          Nombre d'objets par rareté
        </h3>

        <div className="flex items-center space-x-2">
          {/* Bouton Effacer tout */}
          <button
            type="button"
            onClick={handleClearAllRarities}
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
            onClick={handleRandomize}
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
        Définissez le nombre d'objets de chaque rareté à inclure dans la
        boutique.
      </p>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rarities.map((rarity) => {
            const value =
              (shopConfig?.itemsPerRarity &&
                shopConfig.itemsPerRarity[rarity]) ||
              0;
            return (
              <div key={rarity}>
                <label
                  htmlFor={`rarity-${rarity}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {rarity}
                </label>
                <input
                  type="number"
                  id={`rarity-${rarity}`}
                  min="0"
                  max="50"
                  value={value}
                  onChange={(e) => handleRarityChange(rarity, e.target.value)}
                  onFocus={(e) => e.target.select()} // CORRECTION : Sélectionner le texte au focus
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
