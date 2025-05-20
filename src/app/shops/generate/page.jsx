// /shop/generate/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RaritySelector from "../../components/shops/RaritySelector";
import TypeChanceSelector from "../../components/shops/TypeChanceSelector";
import ShopDetailsForm from "../../components/shops/ShopDetailsForm";
import ShopItemsTable from "../../components/shops/ShopItemsTable";
import ItemSelector from "../../components/shops/ItemSelector";
import StatusMessage from "../../components/shops/StatusMessage";
import PresetSelector from "../../components/presets/PresetSelector";
import {
  fetchTypesAndRarities,
  initialiseShopConfig,
  generateShopData,
  saveShopData,
} from "../../lib/shopGeneratorUtils";

export default function GenerateShop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetId = searchParams.get("preset");

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
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(!presetId);

  // Chargement des types et raretés disponibles
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);

        // Récupération des types et raretés
        const { types: typesList, rarities: raritiesList } =
          await fetchTypesAndRarities();

        // Vérification des données reçues
        if (!Array.isArray(typesList) || !Array.isArray(raritiesList)) {
          console.error("Données invalides reçues:", {
            types: typesList,
            rarities: raritiesList,
          });

          // Fournir des valeurs par défaut pour éviter les erreurs
          setTypes(Array.isArray(typesList) ? typesList : []);
          setRarities(Array.isArray(raritiesList) ? raritiesList : []);

          setError("Erreur: format de données invalide reçu de l'API");
        } else {
          // Données valides
          setTypes(typesList);
          setRarities(raritiesList);

          // Initialisation de la configuration de la boutique
          const { shopConfig, totalPercentage } = await initialiseShopConfig(
            typesList,
            raritiesList,
            presetId
          );
          setShopConfig(shopConfig);
          setTotalPercentage(totalPercentage);

          // Si un preset a été chargé, afficher un message
          if (presetId) {
            setSuccess("Preset chargé avec succès");
            setTimeout(() => setSuccess(""), 3000);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des options:", error);
        setError(
          "Échec du chargement des options: " +
            (error.message || "Erreur inconnue")
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [presetId]);

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

  // Gestionnaire pour sélectionner un preset
  const handlePresetSelect = (preset) => {
    // Appliquer les configurations du preset
    if (preset) {
      setShopConfig({
        itemsPerRarity: { ...preset.rarityConfig },
        typeChances: { ...preset.typeChances },
      });

      // Mettre à jour le pourcentage total
      const total = Object.values(preset.typeChances).reduce(
        (sum, value) => sum + (parseInt(value) || 0),
        0
      );
      setTotalPercentage(total);

      // Masquer le sélecteur de preset après la sélection
      setShowPresetSelector(false);

      // Afficher un message de succès
      setSuccess(`Preset "${preset.name}" appliqué avec succès.`);
      setTimeout(() => setSuccess(""), 3000);
    }
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
      if (
        (rarity.toLowerCase().includes("commun") &&
          rarity.toLowerCase() !== "peu commun") ||
        rarity.toLowerCase() === "neutre" ||
        rarity.toLowerCase() === "variable"
      ) {
        newItemsPerRarity[rarity] = Math.floor(Math.random() * 6) + 3; // 3-8 pour Commun, Neutre et Variable
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

  // Fonction pour ajouter un objet à la boutique
  const addItemToShop = (item) => {
    // Vérifier si l'objet est déjà dans la boutique
    if (!shopItems.some((existingItem) => existingItem.IDX === item.IDX)) {
      setShopItems([...shopItems, item]);
      setSuccess("Objet ajouté à la boutique");
      setTimeout(() => setSuccess(""), 2000);
    } else {
      setError("Cet objet est déjà dans la boutique");
      setTimeout(() => setError(""), 2000);
    }
  };

  // Fonction pour supprimer un objet de la boutique
  const removeItemFromShop = (itemId) => {
    setShopItems(shopItems.filter((item) => item.IDX !== itemId));
    setSuccess("Objet retiré de la boutique");
    setTimeout(() => setSuccess(""), 2000);
  };

  // Génération de la boutique
  const generateShop = async () => {
    // Vérifier que les pourcentages totalisent 100%
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
      // Appel à l'API pour générer la boutique
      const items = await generateShopData(shopConfig);
      setShopItems(items);
      setSuccess("Boutique générée avec succès !");
      setTimeout(() => setSuccess(""), 3000);

      // Activer le sélecteur d'objets automatiquement
      setShowItemSelector(true);
    } catch (error) {
      console.error("Erreur lors de la génération de la boutique:", error);
      setError("Erreur lors de la génération de la boutique: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Sauvegarde de la boutique
  const saveShop = async () => {
    // Validation des données
    if (!shopName.trim()) {
      setError("Le nom de la boutique est obligatoire");

      // Mise en évidence du champ de nom avec une animation de secousse
      const shopNameField = document.getElementById("shop-name-field");
      if (shopNameField) {
        shopNameField.classList.add("shake-animation");
        shopNameField.focus();
        setTimeout(() => {
          shopNameField.classList.remove("shake-animation");
        }, 500);
      }

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
      // Appel à l'API pour sauvegarder la boutique
      await saveShopData(shopName, shopDescription, shopItems);

      setSuccess("Boutique sauvegardée avec succès");

      // Rediriger vers la liste des boutiques après un court délai
      setTimeout(() => {
        router.push("/shops");
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la boutique:", error);
      setError("Erreur lors de la sauvegarde: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <h1 className="text-xl font-medium text-gray-800">
          Générer une Boutique
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configurer et générer une boutique D&D aléatoire
        </p>
      </div>

      <div className="p-4">
        <StatusMessage error={error} success={success} />

        {/* Sélecteur de présets */}
        {showPresetSelector ? (
          <div className="mb-6">
            <PresetSelector onPresetSelect={handlePresetSelect} />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPresetSelector(false)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
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
                Ignorer les présets
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setShowPresetSelector(true)}
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
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
              Utiliser un preset
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-indigo-500"
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

            {/* Bouton Générer la boutique modernisé */}
            <button
              type="button"
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 text-md rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
              onClick={() => {
                generateShop();
                // Scroll automatique vers la section de boutique générée
                setTimeout(() => {
                  const shopSection = document.getElementById(
                    "generated-shop-section"
                  );
                  if (shopSection) {
                    shopSection.scrollIntoView({ behavior: "smooth" });
                  }
                }, 1000); // Délai pour laisser le temps à la boutique de se générer
              }}
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
                  Génération...
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Générer la boutique
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(rarities) && rarities.length > 0 ? (
              <RaritySelector
                rarities={rarities}
                shopConfig={shopConfig}
                onRarityChange={handleRarityChange}
                onRandomize={randomizeRarities}
              />
            ) : (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-amber-600">
                  Chargement des raretés en cours ou aucune rareté disponible...
                </p>
              </div>
            )}

            {Array.isArray(types) && types.length > 0 ? (
              <div className="relative">
                <TypeChanceSelector
                  types={types}
                  shopConfig={shopConfig}
                  onTypeChanceChange={handleTypeChanceChange}
                  onNormalize={normalizePercentages}
                  onRandomize={randomizeTypeChances}
                  totalPercentage={totalPercentage}
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-amber-600">
                  Chargement des types en cours ou aucun type disponible...
                </p>
              </div>
            )}
          </div>
        </div>

        {shopItems.length > 0 && (
          <div id="generated-shop-section" className="animate-fadeIn">
            <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-indigo-500"
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

            <ShopItemsTable
              shopItems={shopItems}
              onRemoveItem={removeItemFromShop}
            />

            {/* Toggle pour le sélecteur d'objets */}
            <div className="mt-6 mb-2">
              <button
                type="button"
                onClick={() => setShowItemSelector(!showItemSelector)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {showItemSelector ? (
                  <>
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
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    Masquer le sélecteur d'objets
                  </>
                ) : (
                  <>
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
                    Ajouter des objets à la boutique
                  </>
                )}
              </button>
            </div>

            {/* Sélecteur d'objets */}
            {showItemSelector && (
              <div className="mt-2 mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Ajouter des objets personnalisés
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Recherchez et ajoutez des objets supplémentaires à votre
                    boutique
                  </p>
                </div>
                <ItemSelector onAddItem={addItemToShop} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Style pour l'animation de secousse */}
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .shake-animation {
          animation: shake 0.5s;
          animation-iteration-count: 1;
          border-color: #ef4444 !important;
          background-color: #fef2f2 !important;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
