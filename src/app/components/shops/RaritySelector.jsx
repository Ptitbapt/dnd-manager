// components/shops/RaritySelector.jsx
"use client";
import { useState } from "react";

export default function RaritySelector({
  rarities,
  shopConfig,
  onRarityChange,
  onRandomize,
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <h3 className="text-md font-semibold mb-4 flex items-center justify-between border-b pb-2 border-amber-200">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-amber-500"
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
          Objets par rareté
          <span className="ml-2 text-xs text-gray-500 font-normal">
            (nombre d'objets)
          </span>
        </div>
        <button
          type="button"
          className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs hover:bg-amber-200 transition-colors flex items-center"
          onClick={onRandomize}
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
          Randomiser
        </button>
      </h3>

      <div className="space-y-3">
        {rarities.map((rarity) => (
          <div key={rarity} className="flex items-center">
            <span
              className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white ${
                rarity.toLowerCase().includes("commun")
                  ? "bg-gray-500"
                  : rarity.toLowerCase().includes("peu commun")
                  ? "bg-green-500"
                  : rarity.toLowerCase().includes("rare")
                  ? "bg-blue-500"
                  : rarity.toLowerCase().includes("très rare")
                  ? "bg-purple-500"
                  : rarity.toLowerCase().includes("légendaire")
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            >
              {shopConfig.itemsPerRarity[rarity] || 0}
            </span>
            <label
              htmlFor={`rarity-${rarity}`}
              className="text-sm font-medium text-gray-700 mr-auto"
            >
              {rarity}
            </label>
            <input
              type="range"
              id={`rarity-${rarity}`}
              value={Math.min(shopConfig.itemsPerRarity[rarity] || 0, 10)}
              onChange={(e) => onRarityChange(rarity, e.target.value)}
              min="0"
              max="10"
              step="1"
              className="w-24 h-2 mx-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
            />
            <input
              type="number"
              value={shopConfig.itemsPerRarity[rarity] || 0}
              onChange={(e) => onRarityChange(rarity, e.target.value)}
              min="0"
              className="form-input w-16 text-center bg-amber-50 border-amber-200 focus:border-amber-400 focus:ring focus:ring-amber-200 focus:ring-opacity-50 transition-all"
              title="Vous pouvez entrer n'importe quelle valeur positive"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p className="italic">
          Définissez combien d'objets de chaque rareté vous souhaitez avoir dans
          votre boutique. <strong>Note :</strong> Vous pouvez saisir des valeurs
          supérieures à 10 directement dans les champs numériques.
        </p>
      </div>
    </div>
  );
}
