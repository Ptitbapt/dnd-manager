// src/app/components/shops/TypeChanceSelector.jsx - Fichier complet modifié

import { useState } from "react";

export default function TypeChanceSelector({
  types,
  shopConfig,
  onTypeChanceChange,
  onNormalize,
  onRandomize,
  totalPercentage,
}) {
  const [expanded, setExpanded] = useState(true);

  // Vérifier si types est un tableau
  if (!Array.isArray(types)) {
    console.error("Les types ne sont pas un tableau:", types);
    // Utiliser un tableau vide pour éviter l'erreur
    types = [];
  }

  // Fonction pour basculer l'expansion
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Distribution des types d'objets
        </h3>

        <div className="flex items-center space-x-2">
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

      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-500">
          Définissez la répartition des types d'objets en pourcentage.
        </p>

        <button
          type="button"
          onClick={onNormalize}
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
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
            />
          </svg>
          Normaliser
        </button>
      </div>

      <div className="flex justify-end">
        <div
          className={`text-sm font-medium ${
            totalPercentage === 100
              ? "text-green-600"
              : totalPercentage < 100
              ? "text-amber-600"
              : "text-red-600"
          }`}
        >
          Total: {totalPercentage}%
        </div>
      </div>

      {expanded && (
        <div className="mt-2 space-y-4">
          {types.map((type) => {
            const value = shopConfig.typeChances[type] || 0;
            return (
              <div key={type} className="flex items-center">
                <label
                  htmlFor={`type-${type}`}
                  className="block text-sm font-medium text-gray-700 mr-2 w-44 truncate"
                  title={type}
                >
                  {type}
                </label>
                <div className="relative flex-grow">
                  <input
                    type="range"
                    id={`type-${type}-range`}
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onTypeChanceChange(type, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    id={`type-${type}`}
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onTypeChanceChange(type, e.target.value)}
                    className="w-20 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ml-3"
                  />
                  <span className="absolute right-2 top-1.5 text-gray-500 sm:text-sm">
                    %
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
