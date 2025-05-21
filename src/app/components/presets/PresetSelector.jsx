"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getWealthLevels,
  getShopTypes,
  normalizeText,
} from "../../lib/presetUtils";

export default function PresetSelector({ onPresetSelect }) {
  const [presets, setPresets] = useState([]);
  const [filteredPresets, setFilteredPresets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Filtres
  const [wealthFilter, setWealthFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Ajout de la recherche par texte

  // Options
  const wealthLevels = getWealthLevels();
  const shopTypes = getShopTypes();

  // Chargement des présets au montage du composant
  useEffect(() => {
    async function loadPresets() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/presets");
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error("Erreur parsing JSON:", e);
          throw new Error("Format de réponse invalide");
        }

        // Vérifier et normaliser les présets
        if (!data.presets || !Array.isArray(data.presets)) {
          console.error("Format de présets invalide:", data);
          throw new Error("Format de présets invalide");
        }

        // Les présets sont déjà normalisés par l'API, mais on applique quand même
        // notre propre normalisation pour être sûr
        const normalizedPresets = data.presets.map(normalizePreset);

        setPresets(normalizedPresets);
        setFilteredPresets(normalizedPresets);
      } catch (err) {
        console.error("Erreur lors du chargement des présets:", err);
        setError(
          "Impossible de charger les présets. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPresets();
  }, []);

  // Fonction pour normaliser un preset
  const normalizePreset = (preset) => {
    // Copie de base du preset
    const normalizedPreset = { ...preset };

    // Vérification et normalisation de typeChances
    if (!normalizedPreset.typeChances) {
      normalizedPreset.typeChances = {};
    } else if (typeof normalizedPreset.typeChances === "string") {
      try {
        normalizedPreset.typeChances = JSON.parse(normalizedPreset.typeChances);
      } catch (e) {
        console.error(
          `Erreur parsing typeChances pour preset ${preset.id}:`,
          e
        );
        normalizedPreset.typeChances = {};
      }
    }

    // Vérification et normalisation de rarityConfig
    if (!normalizedPreset.rarityConfig) {
      normalizedPreset.rarityConfig = {};
    } else if (typeof normalizedPreset.rarityConfig === "string") {
      try {
        normalizedPreset.rarityConfig = JSON.parse(
          normalizedPreset.rarityConfig
        );
      } catch (e) {
        console.error(
          `Erreur parsing rarityConfig pour preset ${preset.id}:`,
          e
        );
        normalizedPreset.rarityConfig = {};
      }
    }

    // S'assurer que toutes les valeurs sont des nombres positifs
    // et calculer le total actuel des pourcentages
    let totalTypeChances = 0;
    Object.keys(normalizedPreset.typeChances).forEach((key) => {
      const value = Math.max(
        0,
        parseInt(normalizedPreset.typeChances[key]) || 0
      );
      normalizedPreset.typeChances[key] = value;
      totalTypeChances += value;
    });

    Object.keys(normalizedPreset.rarityConfig).forEach((key) => {
      normalizedPreset.rarityConfig[key] = Math.max(
        0,
        parseInt(normalizedPreset.rarityConfig[key]) || 0
      );
    });

    // Normalisation des pourcentages pour qu'ils totalisent 100%
    if (
      totalTypeChances !== 100 &&
      totalTypeChances > 0 &&
      Object.keys(normalizedPreset.typeChances).length > 0
    ) {
      // Ajuster pour que le total soit exactement 100%
      console.log(
        `Normalisation du preset ${preset.id} - Total actuel: ${totalTypeChances}%`
      );

      // Calculer un facteur d'échelle pour ramener à 100%
      const factor = 100 / totalTypeChances;
      let newTotal = 0;
      const keys = Object.keys(normalizedPreset.typeChances);

      // Premier passage: ajuster toutes les valeurs sauf la dernière
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const adjustedValue = Math.round(
          normalizedPreset.typeChances[key] * factor
        );
        normalizedPreset.typeChances[key] = adjustedValue;
        newTotal += adjustedValue;
      }

      // Dernier élément: assigner ce qui reste pour atteindre exactement 100%
      const lastKey = keys[keys.length - 1];
      normalizedPreset.typeChances[lastKey] = 100 - newTotal;

      console.log(`Normalisation terminée - Nouveau total: 100%`);
    } else if (
      totalTypeChances === 0 &&
      Object.keys(normalizedPreset.typeChances).length > 0
    ) {
      // Si le total est 0 mais qu'il y a des types, faire une distribution égale
      console.log(
        `Distribution égale pour le preset ${preset.id} - Total actuel: 0%`
      );

      const keys = Object.keys(normalizedPreset.typeChances);
      const baseValue = Math.floor(100 / keys.length);
      let remaining = 100;

      // Premier passage: donner une valeur égale à tous sauf le dernier
      for (let i = 0; i < keys.length - 1; i++) {
        normalizedPreset.typeChances[keys[i]] = baseValue;
        remaining -= baseValue;
      }

      // Dernier élément: assigner ce qui reste
      normalizedPreset.typeChances[keys[keys.length - 1]] = remaining;

      console.log(`Distribution égale terminée - Nouveau total: 100%`);
    }

    return normalizedPreset;
  };

  // Fonction pour normaliser le texte (retirer les accents et caractères spéciaux)
  const normalizeText = (text) => {
    if (!text) return "";

    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
      .replace(/[^\w\s]/gi, "") // Retirer les caractères spéciaux
      .replace(/\s+/g, ""); // Retirer les espaces
  };

  // Filtrer les présets lorsque les filtres changent
  useEffect(() => {
    if (presets.length === 0) return;

    let filtered = [...presets];

    if (wealthFilter) {
      filtered = filtered.filter(
        (preset) => preset.wealthLevel === wealthFilter
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((preset) => preset.shopType === typeFilter);
    }

    // Filtre par recherche textuelle avec normalisation
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeText(searchQuery);
      filtered = filtered.filter(
        (preset) =>
          normalizeText(preset.name).includes(normalizedQuery) ||
          (preset.description &&
            normalizeText(preset.description).includes(normalizedQuery))
      );
    }

    setFilteredPresets(filtered);
  }, [wealthFilter, typeFilter, searchQuery, presets]);

  // Gestionnaire de sélection de preset
  const handlePresetSelect = (preset) => {
    const normalizedPreset = normalizePreset(preset);

    // Vérifier que les pourcentages totalisent bien 100%
    const total = Object.values(normalizedPreset.typeChances).reduce(
      (sum, val) => sum + val,
      0
    );

    console.log(`Sélection du preset ${preset.id} avec un total de ${total}%`);

    setSelectedPreset(normalizedPreset);

    if (onPresetSelect) {
      onPresetSelect(normalizedPreset);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setWealthFilter("");
    setTypeFilter("");
    setSearchQuery("");
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-indigo-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
          </svg>
          Présets de boutique
        </h3>
        <p className="text-sm text-gray-500">
          Sélectionnez un preset pour configurer rapidement votre boutique
        </p>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Barre de recherche */}
        <div>
          <label
            htmlFor="searchQuery"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Rechercher
          </label>
          <input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nom ou description..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="wealthFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Niveau de richesse
          </label>
          <select
            id="wealthFilter"
            value={wealthFilter}
            onChange={(e) => setWealthFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Tous les niveaux</option>
            {wealthLevels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="typeFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Type de boutique
          </label>
          <select
            id="typeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Tous les types</option>
            {shopTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bouton de réinitialisation des filtres */}
      {(wealthFilter || typeFilter || searchQuery) && (
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Liste des présets */}
      {isLoading ? (
        <div className="text-center py-4">
          <svg
            className="animate-spin h-6 w-6 mx-auto text-indigo-500"
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
          <p className="mt-2 text-sm text-gray-500">
            Chargement des présets...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          <p>{error}</p>
        </div>
      ) : filteredPresets.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>Aucun preset ne correspond aux critères de filtrage</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Bouton pour créer un nouveau preset */}
          <Link href="/presets/add" className="no-underline">
            <div className="border border-dashed border-indigo-300 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md hover:border-indigo-500 flex flex-col items-center justify-center h-full min-h-32 bg-indigo-50 hover:bg-indigo-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-indigo-500 mb-2"
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
              <h4 className="font-medium text-indigo-700">
                Créer un nouveau preset
              </h4>
              <p className="text-sm text-indigo-500 text-center">
                Définir une configuration personnalisée
              </p>
            </div>
          </Link>

          {/* Présets existants */}
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedPreset?.id === preset.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
              onClick={() => handlePresetSelect(preset)}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-gray-800">{preset.name}</h4>
                {preset.isDefault && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Défaut
                  </span>
                )}
              </div>

              <p
                className="text-sm text-gray-500 mb-2 line-clamp-2"
                title={preset.description}
              >
                {preset.description || "Aucune description"}
              </p>

              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  {wealthLevels.find((w) => w.id === preset.wealthLevel)
                    ?.name || preset.wealthLevel}
                </span>
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  {shopTypes.find((t) => t.id === preset.shopType)?.name ||
                    preset.shopType}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton d'application du preset sélectionné */}
      {selectedPreset && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => onPresetSelect(selectedPreset)}
          >
            Appliquer le preset
          </button>
        </div>
      )}
    </div>
  );
}
