"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  normalizeText,
  formatNameForAideDD,
  getAideDDUrl,
  getTypeColor,
  getRarityClasses,
} from "../lib/utils";

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérification défensive pour types et rarities
  useEffect(() => {
    if (!Array.isArray(types)) {
      console.error("Les types ne sont pas un tableau:", types);
      setTypes([]);
    }

    if (!Array.isArray(rarities)) {
      console.error("Les raretés ne sont pas un tableau:", rarities);
      setRarities([]);
    }
  }, [types, rarities]);

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        setError(null);

        console.log("Chargement des données...");

        const [itemsResponse, typesResponse, raritiesResponse] =
          await Promise.all([
            fetch("/api/items"),
            fetch("/api/items?action=types"),
            fetch("/api/items?action=rarities"),
          ]);

        if (itemsResponse.ok && typesResponse.ok && raritiesResponse.ok) {
          try {
            const itemsData = await itemsResponse.json();
            const typesData = await typesResponse.json();
            const raritiesData = await raritiesResponse.json();

            console.log("Données reçues:", {
              items: itemsData,
              itemsLength: Array.isArray(itemsData)
                ? itemsData.length
                : "pas un tableau",
              itemsType: typeof itemsData,
              firstItem:
                Array.isArray(itemsData) && itemsData.length > 0
                  ? itemsData[0]
                  : "aucun item",
              types: typesData,
              rarities: raritiesData,
            });

            // Correction : L'API retourne directement le tableau d'items
            const processedItems = Array.isArray(itemsData) ? itemsData : [];

            const processedTypes = Array.isArray(typesData.types)
              ? typesData.types
              : Array.isArray(typesData)
              ? typesData
              : [];

            const processedRarities = Array.isArray(raritiesData.rarities)
              ? raritiesData.rarities
              : Array.isArray(raritiesData)
              ? raritiesData
              : [];

            console.log("Données traitées:", {
              items: processedItems,
              itemsLength: processedItems.length,
              firstItem: processedItems[0] || "aucun item",
              types: processedTypes,
              rarities: processedRarities,
            });

            // Debug spécifique si aucun item
            if (processedItems.length === 0) {
              console.log("🚨 AUCUN ITEM TROUVÉ!");
              console.log("Réponse brute de l'API items:", itemsData);
              console.log(
                "Est-ce que itemsData est un tableau?",
                Array.isArray(itemsData)
              );
            }

            setItems(processedItems);
            setTypes(processedTypes);
            setRarities(processedRarities);
          } catch (parseError) {
            console.error("Erreur lors de l'analyse des données:", parseError);
            setError("Erreur lors de l'analyse des données");
            setItems([]);
            setTypes([]);
            setRarities([]);
          }
        } else {
          console.error("Erreur lors de la récupération des données:", {
            items: itemsResponse.status,
            types: typesResponse.status,
            rarities: raritiesResponse.status,
          });
          setError("Erreur lors de la récupération des données");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des objets:", error);
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Vérifie si une valeur est une chaîne de caractères valide
  const isValidString = (value) => {
    return value !== null && value !== undefined && typeof value === "string";
  };

  // Fonction pour vérifier si le terme de recherche est un nombre (pour l'ID)
  const isNumericSearch = (term) => {
    return !isNaN(term) && !isNaN(parseFloat(term)) && term.trim() !== "";
  };

  // Filtrer les items avec vérification défensive et recherche par ID
  // CORRECTION: Utiliser les noms de colonnes PostgreSQL (minuscules)
  const filteredItems = Array.isArray(items)
    ? items.filter((item) => {
        // Vérifier que l'item est valide - utiliser nomobjet (PostgreSQL)
        if (!item || !isValidString(item.nomobjet)) return false;

        // Filtre par nom ou ID
        let nameOrIdMatches = false;
        if (filter === "") {
          nameOrIdMatches = true;
        } else {
          // Si le terme de recherche est numérique, chercher aussi par ID
          if (isNumericSearch(filter)) {
            const searchId = parseInt(filter);

            // Vérification explicite de l'ID (utiliser index pour PostgreSQL)
            const idMatches =
              item.index === searchId || String(item.index) === filter;

            // Recherche textuelle également
            const nameMatches = normalizeText(item.nomobjet).includes(
              normalizeText(filter || "")
            );

            nameOrIdMatches = idMatches || nameMatches;
          } else {
            // Recherche textuelle classique sur le nom
            nameOrIdMatches = normalizeText(item.nomobjet).includes(
              normalizeText(filter || "")
            );
          }
        }

        return (
          nameOrIdMatches &&
          (typeFilter === "" || item.type === typeFilter) &&
          (rarityFilter === "" || item.rarete === rarityFilter)
        );
      })
    : [];

  const handleDelete = async (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet objet ?")) {
      try {
        const response = await fetch(`/api/items/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          // Utiliser index pour filtrer après suppression
          setItems(items.filter((item) => item.index !== id));
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'objet:", error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-medium text-gray-800">
            Liste des Objets
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredItems.length} objets disponibles
          </p>
        </div>
        <Link href="/items/add">
          <button
            type="button"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
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
            Ajouter un Objet
          </button>
        </Link>
      </div>

      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label
              htmlFor="search"
              className="block mb-2 font-medium text-gray-700"
            >
              Recherche
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                placeholder="Nom de l'objet ou ID..."
              />
            </div>
            {/* Indication du type de recherche */}
            {filter && (
              <p className="text-xs text-gray-500 mt-1">
                {isNumericSearch(filter)
                  ? "Recherche par ID et nom"
                  : "Recherche par nom"}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className="block mb-2 font-medium text-gray-700"
            >
              Type
            </label>
            <div className="relative">
              <select
                id="type"
                name="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-3 pr-10 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 appearance-none bg-white cursor-pointer"
              >
                <option value="">Tous les types</option>
                {Array.isArray(types) &&
                  types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="rarity"
              className="block mb-2 font-medium text-gray-700"
            >
              Rareté
            </label>
            <div className="relative">
              <select
                id="rarity"
                name="rarity"
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="pl-3 pr-10 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 appearance-none bg-white cursor-pointer"
              >
                <option value="">Toutes les raretés</option>
                {Array.isArray(rarities) &&
                  rarities.map((rarity) => (
                    <option key={rarity} value={rarity}>
                      {rarity}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="p-6 text-center">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-indigo-500 mb-3"
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
            <p className="text-gray-600">Chargement des objets...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-6 text-center">
            <svg
              className="h-12 w-12 mx-auto text-gray-400 mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-600">
              Aucun objet trouvé. Ajustez vos filtres ou ajoutez de nouveaux
              objets.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="overflow-y-auto max-h-[calc(100vh-350px)] border-b border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Index
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rareté
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valeur
                        </th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(filteredItems) &&
                        filteredItems.map((item) => (
                          <tr key={item.index} className="hover:bg-gray-50">
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-mono text-gray-500 w-[8%]">
                              #{item.index}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900 w-[20%]">
                              <a
                                href={getAideDDUrl(item.nomobjet)}
                                target="_blank"
                                className="hover:text-indigo-600 hover:underline flex items-center"
                                rel="noopener noreferrer"
                                title={`Voir sur AideDD: ${item.nomobjet}`}
                              >
                                {item.nomobjet}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 ml-1 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            </td>
                            <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-500 w-[20%]">
                              <div className="flex items-center">
                                <span
                                  className={`inline-flex items-center justify-center w-3 h-3 rounded-full mr-2 ${
                                    isValidString(item.type)
                                      ? getTypeColor(item.type)
                                      : "bg-indigo-500"
                                  }`}
                                ></span>
                                {item.type}{" "}
                                {item.soustype ? `(${item.soustype})` : ""}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 w-[12%]">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isValidString(item.rarete)
                                    ? getRarityClasses(item.rarete)
                                    : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                {item.rarete}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-[12%]">
                              {item.valeur ? `${item.valeur} PO` : "-"}
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 w-[12%]">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                {item.source}
                              </span>
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium w-[16%]">
                              <div className="flex items-center justify-end space-x-2">
                                <Link
                                  href={`/items/${item.index}`}
                                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Modifier
                                </Link>
                                <button
                                  onClick={() => handleDelete(item.index)}
                                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
