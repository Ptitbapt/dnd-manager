// app/shops/page.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ItemLink from "../components/ui/ItemLink";
import TypeBadge from "../components/ui/TypeBadge";
import RarityBadge from "../components/ui/RarityBadge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import { fetchShops, fetchShopItems, deleteShop } from "../lib/shopApiUtils"; // Le chemin est correct ici

export default function ShopsList() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState("");

  // Chargement des boutiques sauvegardées
  useEffect(() => {
    async function loadShops() {
      try {
        setIsLoading(true);
        setError("");

        const shopsData = await fetchShops();
        console.log("Boutiques récupérées:", shopsData);
        setShops(shopsData);
      } catch (error) {
        console.error("Erreur lors du chargement des boutiques:", error);
        setError("Erreur lors du chargement des boutiques: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadShops();
  }, []);

  const loadShopItems = async (shopId) => {
    setIsLoadingItems(true);
    setSelectedShop(shopId);
    setShopItems([]);
    setPurchasedItems({}); // Réinitialiser les articles achetés
    setError("");

    try {
      console.log(`Chargement des objets pour la boutique ID: ${shopId}`);
      const shopData = await fetchShopItems(shopId);
      console.log("Objets récupérés:", shopData);
      setShopItems(shopData.items || []);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des objets de la boutique:",
        error
      );
      setError(`Erreur lors du chargement des objets: ${error.message}`);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette boutique ?")) {
      try {
        console.log(`Suppression de la boutique ID: ${shopId}`);
        await deleteShop(shopId);

        console.log("Boutique supprimée avec succès");
        // Mise à jour de la liste après suppression
        setShops(shops.filter((shop) => shop.id !== shopId));

        // Effacer la boutique sélectionnée si elle a été supprimée
        if (selectedShop === shopId) {
          setSelectedShop(null);
          setShopItems([]);
          setPurchasedItems({});
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la boutique:", error);
        setError(`Erreur lors de la suppression: ${error.message}`);
      }
    }
  };

  // Gérer l'achat d'un objet
  const toggleItemPurchased = (itemId) => {
    setPurchasedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Réapprovisionner la boutique (réinitialiser tous les achats)
  const restockShop = () => {
    if (
      confirm(
        "Voulez-vous réapprovisionner la boutique ? Tous les objets marqués comme achetés seront réinitialisés."
      )
    ) {
      setPurchasedItems({});
    }
  };

  // Icône pour la section des boutiques
  const shopIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 mr-2 text-indigo-600"
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
  );

  // Icône pour la section des objets
  const itemsIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 mr-2 text-indigo-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    </svg>
  );

  // Icône pour l'état vide de boutique
  const emptyShopIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 mx-auto text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  // Icône pour l'état vide d'objets
  const emptyItemsIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 mx-auto text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l-4-4m4 4l4-4"
      />
    </svg>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Panneau de gauche - Liste des boutiques */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 h-full">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
            <h1 className="text-xl font-medium text-gray-800 flex items-center">
              {shopIcon}
              Boutiques sauvegardées
            </h1>
            <Link href="/shops/generate">
              <button
                type="button"
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center text-sm"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nouvelle
              </button>
            </Link>
          </div>

          <div className="overflow-y-auto max-h-[70vh]">
            {error && (
              <div className="p-4">
                <ErrorMessage message={error} />
              </div>
            )}

            {isLoading ? (
              <div className="p-6">
                <LoadingSpinner message="Chargement des boutiques..." />
              </div>
            ) : shops.length === 0 ? (
              <EmptyState
                message="Aucune boutique sauvegardée pour le moment."
                icon={emptyShopIcon}
                actionLink="/shops/generate"
                actionText="Générer votre première boutique"
              />
            ) : (
              <ul className="divide-y divide-gray-200">
                {shops.map((shop) => (
                  <li key={shop.id} className="relative">
                    <div
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        selectedShop === shop.id
                          ? "bg-indigo-100 shadow-inner"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div
                          className="cursor-pointer flex-grow"
                          onClick={() => loadShopItems(shop.id)}
                        >
                          <h3
                            className={`text-sm font-medium ${
                              selectedShop === shop.id
                                ? "text-indigo-800"
                                : "text-gray-800"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 inline mr-1.5 text-indigo-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                            {shop.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 ml-5">
                            {new Date(shop.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-gray-400 bg-gray-50 hover:bg-red-50 hover:text-red-600 p-1.5 rounded-full transition-colors"
                          onClick={() => handleDeleteShop(shop.id)}
                          title="Supprimer la boutique"
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
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Panneau de droite - Détails de la boutique */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 h-full">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-medium text-gray-800 flex items-center">
                {itemsIcon}
                {selectedShop
                  ? shops.find((shop) => shop.id === selectedShop)?.name ||
                    "Objets de la boutique"
                  : "Sélectionner une boutique"}
              </h1>
              {selectedShop && (
                <button
                  onClick={restockShop}
                  className="bg-green-500 hover:bg-green-600 text-white py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center text-sm"
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
                  Réapprovisionner
                </button>
              )}
            </div>
            {selectedShop &&
              shops.find((shop) => shop.id === selectedShop)?.description && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border-l-4 border-indigo-300 ml-7">
                  {shops.find((shop) => shop.id === selectedShop)?.description}
                </p>
              )}
          </div>

          <div className="overflow-auto max-h-[70vh]">
            {!selectedShop ? (
              <EmptyState
                message="Sélectionnez une boutique dans la liste pour voir ses objets"
                icon={emptyItemsIcon}
              />
            ) : isLoadingItems ? (
              <div className="p-10">
                <LoadingSpinner message="Chargement des objets..." size="lg" />
              </div>
            ) : shopItems.length === 0 ? (
              <EmptyState
                message="Aucun objet dans cette boutique"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 12H4M20 12a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0a2 2 0 00-2-2H6a2 2 0 00-2 2m0 0v6a2 2 0 002 2h12a2 2 0 002-2v-6"
                    />
                  </svg>
                }
              />
            ) : (
              <div className="overflow-x-auto p-4">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 rounded-tl-lg">
                        Nom
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Type
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Rareté
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Valeur (PO)
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Source
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-gray-700 rounded-tr-lg">
                        Acheté
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopItems.map((item, index) => (
                      <tr
                        key={item.IDX}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } ${purchasedItems[item.IDX] ? "opacity-60" : ""}`}
                      >
                        <td
                          className={`py-3 px-4 text-sm font-medium text-gray-900 ${
                            purchasedItems[item.IDX] ? "line-through" : ""
                          }`}
                        >
                          <ItemLink name={item.Nomobjet} />
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-gray-700 ${
                            purchasedItems[item.IDX] ? "line-through" : ""
                          }`}
                        >
                          <TypeBadge type={item.Type} subtype={item.Soustype} />
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-gray-700 ${
                            purchasedItems[item.IDX] ? "line-through" : ""
                          }`}
                        >
                          <RarityBadge rarity={item.Rarete} />
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-gray-700 ${
                            purchasedItems[item.IDX] ? "line-through" : ""
                          }`}
                        >
                          {item.Valeur ? `${item.Valeur} PO` : "-"}
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-gray-700 ${
                            purchasedItems[item.IDX] ? "line-through" : ""
                          }`}
                        >
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {item.Source}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleItemPurchased(item.IDX)}
                            className={`p-1.5 rounded-full transition-colors ${
                              purchasedItems[item.IDX]
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            }`}
                            title={
                              purchasedItems[item.IDX]
                                ? "Marquer comme disponible"
                                : "Marquer comme acheté"
                            }
                          >
                            {purchasedItems[item.IDX] ? (
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
                                  d="M5 13l4 4L19 7"
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
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                              </svg>
                            )}
                          </button>
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
