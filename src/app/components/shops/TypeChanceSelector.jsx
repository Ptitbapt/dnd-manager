// src/app/components/shops/TypeChanceSelector.jsx

import { useState } from "react";

export default function TypeChanceSelector({
  types,
  shopConfig,
  totalPercentage,
  onTypeChange,
  onTypeChanceChange, // Ajout de cette prop pour compatibilité
  onRandomize,
  onNormalize,
  onClearAllTypes,
}) {
  const [expanded, setExpanded] = useState(true);

  // Vérifier si types est un tableau
  if (!Array.isArray(types)) {
    console.error("Les types ne sont pas un tableau:", types);
    types = [];
  }

  // Fonction de sécurité pour onTypeChange - prend en compte les deux noms de props
  const handleTypeChange = (type, value) => {
    // Utiliser onTypeChanceChange si disponible, sinon onTypeChange
    const changeHandler = onTypeChanceChange || onTypeChange;
    if (typeof changeHandler === "function") {
      changeHandler(type, value);
    } else {
      console.error("Aucune fonction de changement de type fournie:", {
        onTypeChange,
        onTypeChanceChange,
      });
    }
  };

  // Fonctions de sécurité pour les autres handlers
  const handleRandomize = () => {
    if (typeof onRandomize === "function") {
      onRandomize();
    } else {
      console.error("onRandomize n'est pas une fonction");
    }
  };

  const handleNormalize = () => {
    if (typeof onNormalize === "function") {
      onNormalize();
    } else {
      console.error("onNormalize n'est pas une fonction");
    }
  };

  const handleClearAllTypes = () => {
    if (typeof onClearAllTypes === "function") {
      onClearAllTypes();
    } else {
      console.error("onClearAllTypes n'est pas une fonction");
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
            className="h-5 w-5 mr-2 text-green-500"
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
          {/* Bouton Effacer tout */}
          <button
            type="button"
            onClick={handleClearAllTypes}
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

          {/* Bouton Normaliser */}
          <button
            type="button"
            onClick={handleNormalize}
            className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white shadow-sm text-sm leading-4 font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Normaliser
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
        Définissez la répartition en pourcentage des différents types d'objets
        dans la boutique.
      </p>

      {expanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((type) => {
              const value =
                (shopConfig?.typeChances && shopConfig.typeChances[type]) || 0;
              return (
                <div key={type}>
                  <label
                    htmlFor={`type-${type}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {type}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id={`type-${type}`}
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => handleTypeChange(type, e.target.value)}
                      className="block w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Affichage du total des pourcentages */}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Total des pourcentages :
            </span>
            <span
              className={`font-bold text-lg ${
                totalPercentage === 100
                  ? "text-green-600"
                  : totalPercentage > 100
                  ? "text-red-600"
                  : "text-orange-600"
              }`}
            >
              {totalPercentage || 0}%
            </span>
          </div>

          {/* Avertissement si le total n'est pas 100% */}
          {totalPercentage !== 100 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Les pourcentages doivent totaliser exactement 100%. Utilisez
                le bouton "Normaliser" pour ajuster automatiquement.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
