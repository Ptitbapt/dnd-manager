"use client";

import { useState, useEffect } from "react";
import ItemLink from "../ui/ItemLink";
import TypeBadge from "../ui/TypeBadge";
import RarityBadge from "../ui/RarityBadge";
import { normalizeText } from "../../lib/utils";

export default function ItemSelector({ onAddItem }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);

  // Vérification défensive pour types et rarities
  useEffect(() => {
    if (!Array.isArray(types)) {
      console.error("ItemSelector: Les types ne sont pas un tableau:", types);
      setTypes([]);
    }

    if (!Array.isArray(rarities)) {
      console.error(
        "ItemSelector: Les raretés ne sont pas un tableau:",
        rarities
      );
      setRarities([]);
    }
  }, [types, rarities]);

  // Charger les items et les options de filtrage
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const [itemsResponse, typesResponse, raritiesResponse] =
          await Promise.all([
            fetch("/api/items"),
            fetch("/api/items?action=types"),
            fetch("/api/items?action=rarities"),
          ]);

        if (!itemsResponse.ok || !typesResponse.ok || !raritiesResponse.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        let itemsData, typesData, raritiesData;

        try {
          // Traitement des items
          const itemsResult = await itemsResponse.json();
          itemsData = Array.isArray(itemsResult.items)
            ? itemsResult.items
            : Array.isArray(itemsResult)
            ? itemsResult
            : [];

          // Traitement des types
          const typesResult = await typesResponse.json();
          typesData = Array.isArray(typesResult.types)
            ? typesResult.types
            : Array.isArray(typesResult)
            ? typesResult
            : [];

          // Traitement des raretés
          const raritiesResult = await raritiesResponse.json();
          raritiesData = Array.isArray(raritiesResult.rarities)
            ? raritiesResult.rarities
            : Array.isArray(raritiesResult)
            ? raritiesResult
            : [];

          console.log("Données récupérées:", {
            items: itemsData.length,
            itemsStructure: itemsData.slice(0, 2), // Afficher les 2 premiers items
            types: typesData,
            rarities: raritiesData,
          });

          // Debug spécifique pour comprendre pourquoi la liste est vide
          if (itemsData.length === 0) {
            console.log("ATTENTION: Aucun item récupéré!");
            console.log("Réponse brute des items:", itemsResult);
          }
        } catch (parseError) {
          console.error("Erreur lors du parsing des données:", parseError);
          throw new Error("Erreur lors de l'analyse des données reçues");
        }

        setItems(itemsData);
        setFilteredItems(itemsData);
        setTypes(typesData);
        setRarities(raritiesData);
      } catch (error) {
        console.error("Erreur:", error);
        setError(error.message);
        // Initialiser avec des tableaux vides en cas d'erreur
        setItems([]);
        setFilteredItems([]);
        setTypes([]);
        setRarities([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Fonction pour vérifier si le terme de recherche est un nombre (pour l'ID)
  const isNumericSearch = (term) => {
    return !isNaN(term) && !isNaN(parseFloat(term)) && term.trim() !== "";
  };

  // Filtrer les items à chaque changement de critères
  useEffect(() => {
    if (!Array.isArray(items) || items.length === 0) return;

    console.log("Filtrage avec terme de recherche:", searchTerm);
    console.log("Nombre d'items total:", items.length);

    const filtered = items.filter((item) => {
      if (!item) return false;

      // Debug : afficher quelques items pour vérifier la structure
      if (items.indexOf(item) < 3) {
        console.log("Structure de l'item:", {
          Index: item.Index,
          IDX: item.IDX,
          NomObjet: item.NomObjet,
          Nomobjet: item.Nomobjet,
        });
      }

      // Filtre par nom ou ID
      let nameOrIdMatches = false;
      if (searchTerm === "") {
        nameOrIdMatches = true;
      } else {
        // Si le terme de recherche est numérique, chercher aussi par ID
        if (isNumericSearch(searchTerm)) {
          const searchId = parseInt(searchTerm);
          console.log("Recherche par ID:", searchId);

          // Vérification explicite de l'ID
          const idMatches =
            item.Index === searchId ||
            item.IDX === searchId ||
            String(item.Index) === searchTerm ||
            String(item.IDX) === searchTerm;

          // Recherche textuelle également
          const nameMatches =
            (typeof item.NomObjet === "string" &&
              normalizeText(item.NomObjet).includes(
                normalizeText(searchTerm || "")
              )) ||
            (typeof item.Nomobjet === "string" &&
              normalizeText(item.Nomobjet).includes(
                normalizeText(searchTerm || "")
              ));

          nameOrIdMatches = idMatches || nameMatches;

          // Debug pour l'item 51 spécifiquement
          if (searchId === 51 && (item.Index === 51 || item.IDX === 51)) {
            console.log("Item 51 trouvé:", item);
          }
        } else {
          // Recherche textuelle classique sur le nom
          nameOrIdMatches =
            (typeof item.NomObjet === "string" &&
              normalizeText(item.NomObjet).includes(
                normalizeText(searchTerm || "")
              )) ||
            (typeof item.Nomobjet === "string" &&
              normalizeText(item.Nomobjet).includes(
                normalizeText(searchTerm || "")
              ));
        }
      }

      // Filtre par type
      const typeMatches = selectedType === "" || item.Type === selectedType;

      // Filtre par rareté
      const rarityMatches =
        selectedRarity === "" || item.Rarete === selectedRarity;

      return nameOrIdMatches && typeMatches && rarityMatches;
    });

    console.log("Nombre d'items filtrés:", filtered.length);
    setFilteredItems(filtered);
  }, [searchTerm, selectedType, selectedRarity, items]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedRarity("");
  };

  // Assurez-vous que filteredItems est toujours un tableau
  const safeFilteredItems = Array.isArray(filteredItems) ? filteredItems : [];

  return (
    <div>
      {/* Zone de recherche et de filtrage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label
            htmlFor="searchTerm"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Rechercher
          </label>
          <div className="relative">
            <input
              id="searchTerm"
              type="text"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nom de l'objet ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          {/* Indication du type de recherche */}
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-1">
              {isNumericSearch(searchTerm)
                ? "Recherche par ID et nom"
                : "Recherche par nom"}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="selectedType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Type
          </label>
          <select
            id="selectedType"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
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

        <div>
          <label
            htmlFor="selectedRarity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Rareté
          </label>
          <select
            id="selectedRarity"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
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

      {/* Bouton de réinitialisation des filtres */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={resetFilters}
          className="py-1 px-3 text-xs border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Réinitialiser les filtres
        </button>
      </div>

      {/* Affichage du chargement ou de l'erreur */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <svg
            className="animate-spin h-8 w-8 text-indigo-500"
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
          <span className="ml-2 text-gray-600">Chargement des objets...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
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
              <h3 className="text-sm font-medium text-red-800">
                Erreur de chargement des objets
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Résultats de recherche */}
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-80 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Index
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Nom
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rareté
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Valeur
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {safeFilteredItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          Aucun objet ne correspond à votre recherche
                        </td>
                      </tr>
                    ) : (
                      safeFilteredItems.map((item) => (
                        <tr
                          key={item.Index || item.IDX}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                            #{item.Index || item.IDX}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <ItemLink
                              name={item.NomObjet || item.Nomobjet}
                              className="text-indigo-600"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <TypeBadge
                              type={item.Type}
                              subtype={item.SousType || item.Soustype}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <RarityBadge rarity={item.Rarete} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.Valeur ? `${item.Valeur} PO` : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => onAddItem(item)}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                              title="Ajouter à la boutique"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
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
                              Ajouter
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Informations sur les résultats */}
          <div className="mt-2 text-xs text-gray-500 text-right">
            {safeFilteredItems.length} objet
            {safeFilteredItems.length !== 1 ? "s" : ""} trouvé
            {safeFilteredItems.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
