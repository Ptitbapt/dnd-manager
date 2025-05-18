"use client";
// app/shops/generate/page.jsx
import { useState, useEffect } from "react";
import Link from "next/link";

export default function GenerateShop() {
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [shopConfig, setShopConfig] = useState({
    itemsPerRarity: {},
    typeChances: {},
  });
  const [shopItems, setShopItems] = useState([]);
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalPercentage, setTotalPercentage] = useState(0);

  // Chargement des types et raretés disponibles
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [typesResponse, raritiesResponse] = await Promise.all([
          fetch("/api/items?action=types"),
          fetch("/api/items?action=rarities"),
        ]);

        if (typesResponse.ok && raritiesResponse.ok) {
          const [typesData, raritiesData] = await Promise.all([
            typesResponse.json(),
            raritiesResponse.json(),
          ]);

          setTypes(typesData);
          setRarities(raritiesData);

          // Initialisation des valeurs par défaut
          const defaultItemsPerRarity = {};
          raritiesData.forEach((rarity) => {
            defaultItemsPerRarity[rarity] =
              rarity.includes("Commun") || rarity === "Commun"
                ? 5
                : rarity.includes("Peu commun") || rarity === "Peu commun"
                ? 3
                : rarity.includes("Rare") || rarity === "Rare"
                ? 2
                : rarity.includes("Très rare") || rarity === "Très rare"
                ? 1
                : 0;
          });

          const defaultTypeChances = {};
          typesData.forEach((type) => {
            defaultTypeChances[type] =
              type.includes("Armes") || type === "Armes"
                ? 15
                : type.includes("Armures") || type === "Armures"
                ? 15
                : type.includes("Potion") || type === "Potion"
                ? 20
                : type.includes("Parchemin") || type === "Parchemin"
                ? 10
                : 10;
          });

          setShopConfig({
            itemsPerRarity: defaultItemsPerRarity,
            typeChances: defaultTypeChances,
          });

          // Calculer la somme initiale des pourcentages
          setTimeout(() => {
            calculateTotalPercentage(defaultTypeChances);
          }, 0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des options:", error);
        setError("Échec du chargement des options");
      }
    }

    fetchOptions();
  }, []);

  const calculateTotalPercentage = (typeChances) => {
    const total = Object.values(typeChances).reduce(
      (sum, value) => sum + (parseInt(value) || 0),
      0
    );
    setTotalPercentage(total);
  };

  const handleRarityChange = (rarity, value) => {
    const newValue = parseInt(value, 10) || 0;
    const newItemsPerRarity = {
      ...shopConfig.itemsPerRarity,
      [rarity]: newValue,
    };

    setShopConfig({
      ...shopConfig,
      itemsPerRarity: newItemsPerRarity,
    });
  };

  const handleTypeChanceChange = (type, value) => {
    const newValue = parseInt(value, 10) || 0;
    const newTypeChances = {
      ...shopConfig.typeChances,
      [type]: newValue,
    };

    setShopConfig({
      ...shopConfig,
      typeChances: newTypeChances,
    });

    // Calculer la nouvelle somme des pourcentages
    calculateTotalPercentage(newTypeChances);
  };

  const normalizePercentages = () => {
    if (totalPercentage === 0) return;

    const newTypeChances = { ...shopConfig.typeChances };
    const factor = 100 / totalPercentage;

    // Normaliser les pourcentages pour qu'ils totalisent 100%
    Object.keys(newTypeChances).forEach((type) => {
      newTypeChances[type] = Math.round((newTypeChances[type] || 0) * factor);
    });

    // Ajuster le dernier type pour s'assurer que la somme est exactement 100%
    const newTotal = Object.values(newTypeChances).reduce(
      (sum, value) => sum + value,
      0
    );
    if (newTotal !== 100 && Object.keys(newTypeChances).length > 0) {
      const lastType =
        Object.keys(newTypeChances)[Object.keys(newTypeChances).length - 1];
      newTypeChances[lastType] += 100 - newTotal;
    }

    setShopConfig({
      ...shopConfig,
      typeChances: newTypeChances,
    });

    setTotalPercentage(100);
    setSuccess("Pourcentages normalisés à 100%");
    setTimeout(() => setSuccess(""), 3000);
  };

  const generateShop = async () => {
    if (totalPercentage !== 100) {
      setError(
        "Les pourcentages de types doivent totaliser 100%. Utilisez le bouton 'Normaliser' pour ajuster automatiquement."
      );
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccess("");
    setShopItems([]);

    try {
      const response = await fetch("/api/shops/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemsPerRarity: shopConfig.itemsPerRarity,
          typeChances: shopConfig.typeChances,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.items) {
          setShopItems(data.items);
          setSuccess("Boutique générée avec succès !");
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError("Échec de la génération de la boutique");
        }
      } else {
        setError("Échec de la génération de la boutique");
      }
    } catch (error) {
      console.error("Erreur lors de la génération de la boutique:", error);
      setError("Erreur lors de la génération de la boutique");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveShop = async () => {
    if (!shopName.trim()) {
      setError("Le nom de la boutique est obligatoire");
      return;
    }

    if (shopItems.length === 0) {
      setError("Aucun objet à sauvegarder");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: shopName,
          description: shopDescription,
          items: shopItems,
        }),
      });

      if (response.ok) {
        setSuccess("Boutique sauvegardée avec succès");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Échec de la sauvegarde de la boutique");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la boutique:", error);
      setError("Erreur lors de la sauvegarde de la boutique");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="medieval-title">Générer une Boutique</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configurer et générer une boutique D&D aléatoire
        </p>
      </div>

      <div className="card-body">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 animate-fadeIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 animate-fadeIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-medieval text-medieval-wood mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Objets par rareté */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-md font-semibold mb-4 flex items-center border-b pb-2 border-amber-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-amber-500"
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
                Objets par rareté
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  (nombre d'objets)
                </span>
              </h3>

              <div className="space-y-3">
                {rarities.map((rarity) => (
                  <div key={rarity} className="flex items-center">
                    <span
                      className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white ${
                        rarity.toLowerCase().includes("commun")
                          ? "bg-gray-500"
                          : rarity.toLowerCase().includes("peu commun")
                          ? "bg-green-500"
                          : rarity.toLowerCase().includes("rare")
                          ? "bg-blue-500"
                          : rarity.toLowerCase().includes("très rare")
                          ? "bg-purple-500"
                          : rarity.toLowerCase().includes("légendaire")
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    >
                      {shopConfig.itemsPerRarity[rarity] || 0}
                    </span>
                    <label
                      htmlFor={`rarity-${rarity}`}
                      className="text-sm font-medium text-gray-700 mr-auto"
                    >
                      {rarity}
                    </label>
                    <input
                      type="range"
                      id={`rarity-${rarity}`}
                      value={shopConfig.itemsPerRarity[rarity] || 0}
                      onChange={(e) =>
                        handleRarityChange(rarity, e.target.value)
                      }
                      min="0"
                      max="10"
                      step="1"
                      className="w-24 h-2 mx-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                    />
                    <input
                      type="number"
                      value={shopConfig.itemsPerRarity[rarity] || 0}
                      onChange={(e) =>
                        handleRarityChange(rarity, e.target.value)
                      }
                      min="0"
                      max="20"
                      className="form-input w-16 text-center"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p className="italic">
                  Définissez combien d'objets de chaque rareté vous souhaitez
                  avoir dans votre boutique.
                </p>
              </div>
            </div>

            {/* Chances de type */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-md font-semibold mb-4 flex items-center justify-between border-b pb-2 border-amber-200">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  Chances de type
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (pourcentages)
                  </span>
                </div>
                <div
                  className={`text-sm font-bold ${
                    totalPercentage === 100 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  Total: {totalPercentage}%
                </div>
              </h3>

              <div className="space-y-3">
                {types.map((type) => (
                  <div key={type} className="flex items-center">
                    <div className="w-16 text-center font-medium">
                      {shopConfig.typeChances[type] || 0}%
                    </div>
                    <div className="flex-grow mx-3 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="bg-amber-600 h-2.5 rounded-full"
                        style={{
                          width: `${shopConfig.typeChances[type] || 0}%`,
                        }}
                      ></div>
                    </div>
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm font-medium text-gray-700 w-24"
                    >
                      {type}
                    </label>
                    <input
                      type="number"
                      id={`type-${type}`}
                      value={shopConfig.typeChances[type] || 0}
                      onChange={(e) =>
                        handleTypeChanceChange(type, e.target.value)
                      }
                      min="0"
                      max="100"
                      className="form-input w-16 text-center"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500 italic">
                <p>
                  Les pourcentages déterminent la probabilité que chaque type
                  d'objet apparaisse dans votre boutique. Le total doit être de
                  100%.
                </p>
              </div>

              <div className="mt-4 text-right">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md text-sm hover:bg-amber-200 transition-colors"
                  onClick={normalizePercentages}
                >
                  Normaliser à 100%
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              className="btn-primary flex items-center py-3 px-6 text-lg"
              onClick={generateShop}
              disabled={isGenerating}
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
                  Génération en cours...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
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
        </div>

        {shopItems.length > 0 && (
          <div className="animate-fadeIn">
            <h2 className="text-lg font-medieval text-medieval-wood mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
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
              Boutique générée
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({shopItems.length} objets)
              </span>
            </h2>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="shopName"
                    className="form-label flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1 text-amber-500"
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
                    Nom de la boutique <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="shopName"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="form-input"
                    placeholder="L'Emporium Mystique"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shopDescription"
                    className="form-label flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Description
                  </label>
                  <input
                    type="text"
                    id="shopDescription"
                    value={shopDescription}
                    onChange={(e) => setShopDescription(e.target.value)}
                    className="form-input"
                    placeholder="Une boutique chaleureuse avec des objets magiques"
                  />
                </div>
              </div>

              <div className="mt-4 text-right">
                <button
                  type="button"
                  className="btn-primary flex items-center"
                  onClick={saveShop}
                  disabled={isSaving}
                >
                  {isSaving ? (
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
                      Sauvegarde en cours...
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
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Sauvegarder la boutique
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
              <table className="medieval-table w-full">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="py-3">Nom</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Rareté</th>
                    <th className="py-3">Valeur (PO)</th>
                    <th className="py-3">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {shopItems.map((item, index) => (
                    <tr
                      key={item.IDX}
                      className={index % 2 === 0 ? "bg-white" : "bg-amber-50"}
                    >
                      <td className="whitespace-nowrap py-3 px-4 text-sm font-medium text-gray-900">
                        {item.Nomobjet}
                      </td>
                      <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                        <div className="flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full mr-2 bg-amber-500"></span>
                          {item.Type}{" "}
                          {item.Soustype ? `(${item.Soustype})` : ""}
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                        <span
                          className={`rarity-badge rarity-${item.Rarete.toLowerCase().replace(
                            " ",
                            "-"
                          )}`}
                        >
                          {item.Rarete}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                        {item.Valeur ? `${item.Valeur} PO` : "-"}
                      </td>
                      <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {item.Source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
