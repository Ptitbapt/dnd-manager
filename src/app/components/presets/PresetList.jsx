"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getWealthLevels,
  getShopTypes,
  normalizeText,
} from "../../lib/presetUtils";

export default function PresetList() {
  const [presets, setPresets] = useState([]);
  const [filteredPresets, setFilteredPresets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filtres
  const [wealthFilter, setWealthFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Options
  const wealthLevels = getWealthLevels();
  const shopTypes = getShopTypes();

  // Chargement des présets
  useEffect(() => {
    async function loadPresets() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/presets");
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setPresets(data.presets);
        setFilteredPresets(data.presets);
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

  // Réinitialiser les filtres
  const resetFilters = () => {
    setWealthFilter("");
    setTypeFilter("");
    setSearchQuery("");
  };

  // Supprimer un preset
  const deletePreset = async (id) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce preset ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/presets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      // Mettre à jour la liste des présets après suppression
      setPresets(presets.filter((preset) => preset.id !== id));
      setSuccess("Preset supprimé avec succès");

      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError(err.message || "Une erreur est survenue lors de la suppression");

      // Masquer le message d'erreur après 3 secondes
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-medium text-gray-800">
            Présets de boutique
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos configurations prédéfinies pour la génération de boutique
          </p>
        </div>

        {/* <div className="flex space-x-2">
          <Link
            href="/presets/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nouveau preset
          </Link>
        </div> */}
      </div>

      <div className="p-4">
        {/* Messages de statut */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* Filtres */}
        <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="flex justify-end mt-3">
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
        </div>

        {/* Liste des présets */}
        {isLoading ? (
          <div className="text-center py-8">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-indigo-500"
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
            <p className="mt-2 text-gray-500">Chargement des présets...</p>
          </div>
        ) : filteredPresets.length === 0 &&
          (searchQuery || wealthFilter || typeFilter) ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Aucun preset trouvé
            </h3>
            <p className="mt-1 text-gray-500">
              Essayez de modifier ou de réinitialiser vos filtres de recherche.
            </p>
            <button
              onClick={resetFilters}
              className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : filteredPresets.length === 0 &&
          !(searchQuery || wealthFilter || typeFilter) ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Aucun preset disponible
            </h3>
            <p className="mt-1 text-gray-500">
              Commencez par créer votre premier preset de boutique.
            </p>
            <Link
              href="/presets/add"
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Créer un preset
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Carte d'ajout de preset */}
            <Link href="/presets/add" className="block no-underline">
              <div className="border border-dashed border-indigo-300 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:border-indigo-500 bg-indigo-50 hover:bg-indigo-100">
                <div className="flex items-center">
                  <div className="bg-indigo-100 rounded-full p-3 mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-600"
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
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-indigo-700">
                      Créer un nouveau preset
                    </h3>
                    <p className="text-sm text-indigo-500">
                      Définissez une configuration personnalisée pour vos
                      boutiques
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Tableau des présets */}
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nom
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type de boutique
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Niveau de richesse
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Configuration
                    </th>
                    <th scope="col" className="relative px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPresets.map((preset) => (
                    <tr key={preset.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {preset.name}
                            </div>
                            <div
                              className="text-xs text-gray-500 truncate max-w-xs"
                              title={preset.description}
                            >
                              {preset.description || "Aucune description"}
                            </div>
                          </div>
                          {preset.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Défaut
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shopTypes.find((t) => t.id === preset.shopType)
                            ?.name || preset.shopType}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${
                            preset.wealthLevel === "pauvre"
                              ? "bg-gray-100 text-gray-800"
                              : ""
                          }
                          ${
                            preset.wealthLevel === "standard"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                          ${
                            preset.wealthLevel === "luxueux"
                              ? "bg-purple-100 text-purple-800"
                              : ""
                          }
                        `}
                        >
                          {wealthLevels.find((w) => w.id === preset.wealthLevel)
                            ?.name || preset.wealthLevel}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <div className="flex items-center text-xs text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
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
                            {Object.keys(preset.typeChances).length} types
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
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
                            {Object.values(preset.rarityConfig).reduce(
                              (sum, val) => sum + val,
                              0
                            )}{" "}
                            objets
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/shops/generate?preset=${preset.id}`}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
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
                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                              />
                            </svg>
                            <span className="hidden sm:inline">Utiliser</span>
                          </Link>

                          <Link
                            href={`/presets/${preset.id}`}
                            className="text-green-600 hover:text-green-900 flex items-center"
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                            <span className="hidden sm:inline">Éditer</span>
                          </Link>

                          <button
                            onClick={() => deletePreset(preset.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
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
                            <span className="hidden sm:inline">Supprimer</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Styles pour améliorer l'affichage mobile */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .overflow-x-auto {
            -webkit-overflow-scrolling: touch;
          }

          th,
          td {
            white-space: nowrap;
          }

          th:first-child,
          td:first-child {
            position: sticky;
            left: 0;
            background-color: white;
            z-index: 1;
          }

          th:first-child,
          td:first-child {
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
          }
        }

        /* Fix pour les troncatures de texte */
        .max-w-xs {
          max-width: 14rem;
        }
      `}</style>
    </div>
  );
}
