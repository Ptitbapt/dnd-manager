"use client";
// app/shops/page.jsx
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ShopsList() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState("");

  // Chargement des boutiques sauvegardées
  useEffect(() => {
    async function fetchShops() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/shops");

        if (response.ok) {
          const data = await response.json();
          setShops(data);
        } else {
          setError("Échec du chargement des boutiques");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des boutiques:", error);
        setError("Erreur lors du chargement des boutiques");
      } finally {
        setIsLoading(false);
      }
    }

    fetchShops();
  }, []);

  const loadShopItems = async (shopId) => {
    setIsLoadingItems(true);
    setSelectedShop(shopId);
    setShopItems([]);

    try {
      const response = await fetch(`/api/shops?id=${shopId}`);

      if (response.ok) {
        const data = await response.json();
        setShopItems(data.items || []);
      } else {
        setError("Échec du chargement des objets de la boutique");
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des objets de la boutique:",
        error
      );
      setError("Erreur lors du chargement des objets de la boutique");
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette boutique ?")) {
      try {
        const response = await fetch(`/api/shops?id=${shopId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Mise à jour de la liste après suppression
          setShops(shops.filter((shop) => shop.id !== shopId));

          // Effacer la boutique sélectionnée si elle a été supprimée
          if (selectedShop === shopId) {
            setSelectedShop(null);
            setShopItems([]);
          }
        } else {
          setError("Échec de la suppression de la boutique");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la boutique:", error);
        setError("Erreur lors de la suppression de la boutique");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="card h-full">
          <div className="card-header flex justify-between items-center">
            <h1 className="medieval-title">Boutiques sauvegardées</h1>
            <Link href="/shops/generate">
              <button type="button" className="btn-primary">
                Nouvelle Boutique
              </button>
            </Link>
          </div>

          <div className="card-body p-0">
            {error && <div className="p-4 text-red-600">{error}</div>}

            {isLoading ? (
              <div className="p-6 text-center">
                <p>Chargement des boutiques...</p>
              </div>
            ) : shops.length === 0 ? (
              <div className="p-6 text-center">
                <p>Aucune boutique sauvegardée pour le moment.</p>
                <Link
                  href="/shops/generate"
                  className="text-primary-600 hover:text-primary-900"
                >
                  Générer votre première boutique
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {shops.map((shop) => (
                  <li key={shop.id}>
                    <button
                      className={`w-full text-left px-4 py-3 ${
                        selectedShop === shop.id
                          ? "bg-primary-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => loadShopItems(shop.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {shop.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(shop.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShop(shop.id);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
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
                        </button>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="card h-full">
          <div className="card-header">
            <h1 className="medieval-title">
              {selectedShop
                ? shops.find((shop) => shop.id === selectedShop)?.name ||
                  "Objets de la boutique"
                : "Sélectionner une boutique"}
            </h1>
            {selectedShop &&
              shops.find((shop) => shop.id === selectedShop)?.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {shops.find((shop) => shop.id === selectedShop)?.description}
                </p>
              )}
          </div>

          <div className="card-body p-0">
            {!selectedShop ? (
              <div className="p-6 text-center">
                <p>
                  Sélectionnez une boutique dans la liste pour voir ses objets
                </p>
              </div>
            ) : isLoadingItems ? (
              <div className="p-6 text-center">
                <p>Chargement des objets...</p>
              </div>
            ) : shopItems.length === 0 ? (
              <div className="p-6 text-center">
                <p>Aucun objet dans cette boutique</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="medieval-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Type</th>
                      <th>Rareté</th>
                      <th>Valeur (PO)</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopItems.map((item) => (
                      <tr key={item.IDX}>
                        <td className="whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.Nomobjet}
                        </td>
                        <td className="whitespace-nowrap text-sm text-gray-500">
                          {item.Type}{" "}
                          {item.Soustype ? `(${item.Soustype})` : ""}
                        </td>
                        <td className="whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`rarity-badge rarity-${item.Rarete.toLowerCase().replace(
                              " ",
                              "-"
                            )}`}
                          >
                            {item.Rarete}
                          </span>
                        </td>
                        <td className="whitespace-nowrap text-sm text-gray-500">
                          {item.Valeur}
                        </td>
                        <td className="whitespace-nowrap text-sm text-gray-500">
                          {item.Source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
