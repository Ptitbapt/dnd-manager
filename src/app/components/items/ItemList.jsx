"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ItemLink from "../ui/ItemLink";
import TypeBadge from "../ui/TypeBadge";
import RarityBadge from "../ui/RarityBadge";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import { normalizeText } from "../../lib/utils";

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const [itemsResponse, typesResponse, raritiesResponse] =
          await Promise.all([
            fetch("/api/items"),
            fetch("/api/items?action=types"),
            fetch("/api/items?action=rarities"),
          ]);

        if (itemsResponse.ok && typesResponse.ok && raritiesResponse.ok) {
          const [itemsData, typesData, raritiesData] = await Promise.all([
            itemsResponse.json(),
            typesResponse.json(),
            raritiesResponse.json(),
          ]);
          setItems(itemsData);
          setTypes(typesData);
          setRarities(raritiesData);
        } else {
          setError("Erreur lors du chargement des données");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des objets:", error);
        setError("Erreur lors du chargement des objets");
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    // Normalisation du texte de recherche et du nom de l'objet
    const normalizedFilter = normalizeText(filter);
    const normalizedName = normalizeText(item.Nomobjet);

    return (
      normalizedName.includes(normalizedFilter) &&
      (typeFilter === "" || item.Type === typeFilter) &&
      (rarityFilter === "" || item.Rarete === rarityFilter)
    );
  });

  const handleDelete = async (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet objet ?")) {
      try {
        const response = await fetch(`/api/items/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setItems(items.filter((item) => item.IDX !== id));
        } else {
          setError("Erreur lors de la suppression de l'objet");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'objet:", error);
        setError("Erreur lors de la suppression de l'objet");
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
                placeholder="Nom de l'objet..."
              />
            </div>
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
                {types.map((type) => (
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
                {rarities.map((rarity) => (
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
            <LoadingSpinner message="Chargement des objets..." size="lg" />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorMessage message={error} title="Erreur de chargement" />
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
                      {filteredItems.map((item) => (
                        <tr key={item.IDX} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 w-[20%]">
                            <ItemLink
                              name={item.Nomobjet}
                              title={`Voir sur AideDD: ${item.Nomobjet}`}
                            />
                          </td>
                          <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-500 w-[25%]">
                            <TypeBadge
                              type={item.Type}
                              subtype={item.Soustype}
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 w-[15%]">
                            <RarityBadge rarity={item.Rarete} />
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-[15%]">
                            {item.Valeur ? `${item.Valeur} PO` : "-"}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 w-[15%]">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              {item.Source}
                            </span>
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium w-[10%]">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                href={`/items/${item.IDX}`}
                                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Modifier
                              </Link>
                              <button
                                onClick={() => handleDelete(item.IDX)}
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
