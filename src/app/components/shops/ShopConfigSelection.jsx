"use client";

import React from "react";
import RaritySelector from "./RaritySelector";
import TypeChanceSelector from "./TypeChanceSelector";
import {
  normalizeTypePercentages,
  randomizeTypeChances,
  randomizeRarities,
} from "../../lib/shopConfigUtils";

/**
 * Section de configuration pour la génération de boutique
 */
export default function ShopConfigSection({
  shopConfig,
  metadata,
  uiState,
  onConfigChange,
  onGenerate,
}) {
  const { types, rarities } = metadata;
  const { isLoading, isGenerating, totalPercentage } = uiState;

  // Gestionnaire pour les changements de raretés
  const handleRarityChange = (rarity, value) => {
    const newValue = parseInt(value, 10) || 0;
    const newConfig = {
      ...shopConfig,
      itemsPerRarity: {
        ...shopConfig.itemsPerRarity,
        [rarity]: newValue,
      },
    };

    onConfigChange(newConfig, totalPercentage);
  };

  // Gestionnaire pour les changements de pourcentages de types
  const handleTypeChanceChange = (type, value) => {
    const newValue = parseInt(value, 10) || 0;
    const newTypeChances = {
      ...shopConfig.typeChances,
      [type]: newValue,
    };

    const newConfig = {
      ...shopConfig,
      typeChances: newTypeChances,
    };

    // Calculer le nouveau total
    const newTotal = Object.values(newTypeChances).reduce(
      (sum, value) => sum + (parseInt(value) || 0),
      0
    );

    onConfigChange(newConfig, newTotal);
  };

  // Fonction pour normaliser les pourcentages
  const handleNormalizePercentages = () => {
    if (!shopConfig.typeChances) return;

    const { normalizedTypeChances } = normalizeTypePercentages(
      shopConfig.typeChances
    );

    const newConfig = {
      ...shopConfig,
      typeChances: normalizedTypeChances,
    };

    onConfigChange(newConfig, 100);
  };

  // Fonction pour générer des valeurs aléatoires pour les raretés
  const handleRandomizeRarities = () => {
    if (!rarities || !Array.isArray(rarities)) return;

    const newItemsPerRarity = randomizeRarities(
      rarities,
      shopConfig.itemsPerRarity
    );

    const newConfig = {
      ...shopConfig,
      itemsPerRarity: newItemsPerRarity,
    };

    onConfigChange(newConfig, totalPercentage);
  };

  // Fonction pour générer des pourcentages aléatoires pour les types
  const handleRandomizeTypeChances = () => {
    if (!types || !Array.isArray(types) || types.length === 0) return;

    const newTypeChances = randomizeTypeChances(types);

    const newConfig = {
      ...shopConfig,
      typeChances: newTypeChances,
    };

    onConfigChange(newConfig, 100);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          Configuration de la boutique
        </h2>

        {/* Bouton Générer la boutique */}
        <button
          type="button"
          className={`${
            isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600"
          } text-white py-2 px-4 text-md rounded-lg shadow-sm hover:shadow-md transition-all flex items-center`}
          onClick={onGenerate}
          disabled={isGenerating}
          aria-busy={isGenerating}
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Génération...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Générer la boutique
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.isArray(rarities) && rarities.length > 0 ? (
          <RaritySelector
            rarities={rarities}
            shopConfig={shopConfig}
            onRarityChange={handleRarityChange}
            onRandomize={handleRandomizeRarities}
          />
        ) : (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-amber-600">
              {isLoading
                ? "Chargement des raretés en cours..."
                : "Aucune rareté disponible. Veuillez vérifier la configuration."}
            </p>
          </div>
        )}

        {Array.isArray(types) && types.length > 0 ? (
          <div className="relative">
            <TypeChanceSelector
              types={types}
              shopConfig={shopConfig}
              onTypeChanceChange={handleTypeChanceChange}
              onNormalize={handleNormalizePercentages}
              onRandomize={handleRandomizeTypeChances}
              totalPercentage={totalPercentage}
            />
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-amber-600">
              {isLoading
                ? "Chargement des types en cours..."
                : "Aucun type disponible. Veuillez vérifier la configuration."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
