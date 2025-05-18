// app/shops/generate/page.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import RaritySelector from "../../components/shops/RaritySelector";
import TypeChanceSelector from "../../components/shops/TypeChanceSelector";
import ShopDetailsForm from "../../components/shops/ShopDetailsForm";
import ShopItemsTable from "../../components/shops/ShopItemsTable";
import StatusMessage from "../../components/shops/StatusMessage";

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
  };

  const randomizeRarities = () => {
    const newItemsPerRarity = { ...shopConfig.itemsPerRarity };

    // Générer des valeurs aléatoires pour chaque rareté
    rarities.forEach((rarity) => {
      // Plus la rareté est élevée, moins il y aura d'objets
      if (rarity.toLowerCase().includes("commun")) {
        newItemsPerRarity[rarity] = Math.floor(Math.random() * 6) + 3; // 3-8
      } else if (rarity.toLowerCase().includes("peu commun")) {
        newItemsPerRarity[rarity] = Math.floor(Math.random() * 4) + 1; // 1-4
      } else if (rarity.toLowerCase().includes("rare")) {
        newItemsPerRarity[rarity] = Math.floor(Math.random() * 3) + 0; // 0-2
      } else if (rarity.toLowerCase().includes("très rare")) {
        newItemsPerRarity[rarity] = Math.floor(Math.random() * 2); // 0-1
      } else if (rarity.toLowerCase().includes("légendaire")) {
        newItemsPerRarity[rarity] = Math.random() < 0.2 ? 1 : 0; // 20% de chance d'avoir 1, sinon 0
      } else {
        newItemsPerRarity[rarity] = Math.floor(Math.random() * 3); // 0-2
      }
    });

    setShopConfig({
      ...shopConfig,
      itemsPerRarity: newItemsPerRarity,
    });
  };

  const randomizeTypeChances = () => {
    const newTypeChances = { ...shopConfig.typeChances };

    if (types.length === 0) return;

    // Générer des valeurs aléatoires pour chaque type
    let total = 0;
    types.forEach((type) => {
      newTypeChances[type] = Math.floor(Math.random() * 30) + 5; // Entre 5 et 34
      total += newTypeChances[type];
    });

    // Normaliser pour obtenir un total de 100%
    types.forEach((type) => {
      newTypeChances[type] = Math.floor((newTypeChances[type] / total) * 100);
    });

    // Ajuster pour obtenir exactement 100%
    let newTotal = Object.values(newTypeChances).reduce(
      (sum, val) => sum + val,
      0
    );
    if (newTotal !== 100 && types.length > 0) {
      newTypeChances[types[0]] += 100 - newTotal;
    }

    setShopConfig({
      ...shopConfig,
      typeChances: newTypeChances,
    });

    setTotalPercentage(100);
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
        <StatusMessage error={error} success={success} />

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
            <RaritySelector
              rarities={rarities}
              shopConfig={shopConfig}
              onRarityChange={handleRarityChange}
              onRandomize={randomizeRarities}
            />

            <TypeChanceSelector
              types={types}
              shopConfig={shopConfig}
              onTypeChanceChange={handleTypeChanceChange}
              onNormalize={normalizePercentages}
              onRandomize={randomizeTypeChances}
              totalPercentage={totalPercentage}
            />
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

            <ShopDetailsForm
              shopName={shopName}
              shopDescription={shopDescription}
              onNameChange={setShopName}
              onDescriptionChange={setShopDescription}
              onSave={saveShop}
              isSaving={isSaving}
            />

            <ShopItemsTable shopItems={shopItems} />
          </div>
        )}
      </div>
    </div>
  );
}
