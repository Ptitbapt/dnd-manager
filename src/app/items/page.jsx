"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [loading, setLoading] = useState(true);

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
        }
      } catch (error) {
        console.error("Erreur lors du chargement des objets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Fonction pour normaliser le texte (enlever accents, espaces, et mettre en minuscule)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD") // Décomposer les caractères accentués
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les diacritiques
      .replace(/\s+/g, ""); // Supprimer les espaces
  };

  // Fonction pour formater le nom de l'objet pour l'URL d'AideDD
  const formatNameForAideDD = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "") // Supprimer les caractères spéciaux
      .replace(/\s+/g, "-"); // Remplacer les espaces par des tirets
  };

  const handleItemClick = (name) => {
    const formattedName = formatNameForAideDD(name);
    window.open(
      `https://www.aidedd.org/dnd/om.php?vf=${formattedName}`,
      "_blank"
    );
  };

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
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'objet:", error);
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <div>
          <h1 className="medieval-title">Liste des Objets</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredItems.length} objets disponibles
          </p>
        </div>
        <Link href="/items/add">
          <button
            type="button"
            className="btn-primary flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black rounded-md shadow-sm transition-colors border border-gray-300"
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
              className="form-label block mb-2 font-medium text-gray-700"
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
                className="form-input pl-10 pr-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                placeholder="Nom de l'objet..."
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="type"
              className="form-label block mb-2 font-medium text-gray-700"
            >
              Type
            </label>
            <div className="relative">
              <select
                id="type"
                name="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-select pl-3 pr-10 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 appearance-none bg-white cursor-pointer"
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
              className="form-label block mb-2 font-medium text-gray-700"
            >
              Rareté
            </label>
            <div className="relative">
              <select
                id="rarity"
                name="rarity"
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="form-select pl-3 pr-10 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 appearance-none bg-white cursor-pointer"
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

      <div className="card-body p-0">
        {loading ? (
          <div className="p-6 text-center">
            <p>Chargement des objets...</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="overflow-y-auto max-h-[calc(100vh-350px)] border-b border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((item) => (
                        <tr key={item.IDX} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-[20%]">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handleItemClick(item.Nomobjet);
                              }}
                              className="hover:text-primary-600 hover:underline cursor-pointer"
                              title={`Voir sur AideDD: ${item.Nomobjet}`}
                            >
                              {item.Nomobjet}
                            </a>
                          </td>
                          <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-500 w-[25%]">
                            {item.Type}{" "}
                            {item.Soustype ? `(${item.Soustype})` : ""}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 w-[15%]">
                            <span
                              className={`rarity-badge rarity-${item.Rarete.toLowerCase().replace(
                                " ",
                                "-"
                              )}`}
                            >
                              {item.Rarete}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 w-[15%]">
                            {item.Valeur}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 w-[15%]">
                            {item.Source}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-right text-sm font-medium w-[10%]">
                            <Link
                              href={`/items/${item.IDX}`}
                              className="inline-flex items-center justify-center mr-2 px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Modifier
                            </Link>
                            <button
                              onClick={() => handleDelete(item.IDX)}
                              className="inline-flex items-center justify-center px-2 py-1 text-sm font-medium text-red-600 hover:text-red-800"
                            >
                              Supprimer
                            </button>
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
