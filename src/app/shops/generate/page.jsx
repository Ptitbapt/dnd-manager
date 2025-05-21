"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ShopConfigSection from "../../components/shops/ShopConfigSelection";
import ShopGeneratedSection from "../../components/shops/ShopGeneratedSection";
import StatusMessage from "../../components/shops/StatusMessage";
import PresetSelector from "../../components/presets/PresetSelector";
import { loadInitialShopConfig, applyPreset } from "../../lib/shopConfigUtils";
import "../../styles/shop-animations.css";
import {
  generateShopItems,
  saveShopToDatabase,
  fetchTypesAndRarities,
} from "../../lib/shopGeneratorUtils";

export default function GenerateShop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetId = searchParams.get("preset");

  // États principaux
  const [shopConfig, setShopConfig] = useState({
    itemsPerRarity: {},
    typeChances: {},
  });
  const [shopItems, setShopItems] = useState([]);
  const [shopDetails, setShopDetails] = useState({ name: "", description: "" });

  // États d'interface utilisateur
  const [uiState, setUiState] = useState({
    isLoading: false,
    isGenerating: false,
    isSaving: false,
    showPresetSelector: !presetId,
    showItemSelector: false,
    totalPercentage: 0,
  });

  // États des messages
  const [messages, setMessages] = useState({ error: "", success: "" });

  // États des métadonnées
  const [metadata, setMetadata] = useState({ types: [], rarities: [] });

  // Chargement initial des données
  useEffect(() => {
    async function initialize() {
      setUiState((prev) => ({ ...prev, isLoading: true }));

      try {
        // Charger les types et raretés via l'API
        const { types, rarities } = await fetchTypesAndRarities();
        setMetadata({ types, rarities });

        // Si un preset est spécifié, essayer de le charger via l'API
        let config = {
          itemsPerRarity: {},
          typeChances: {},
        };

        if (presetId) {
          try {
            const { config: loadedConfig, percentage } =
              await loadInitialShopConfig(presetId);
            config = loadedConfig;
            setUiState((prev) => ({
              ...prev,
              totalPercentage: percentage,
            }));
          } catch (error) {
            console.error("Erreur lors du chargement du preset:", error);
            setMessages({
              error:
                "Erreur lors du chargement du preset. Configuration par défaut utilisée.",
              success: "",
            });

            // En cas d'erreur, créer une configuration par défaut
            config = {
              itemsPerRarity: {},
              typeChances: {},
            };

            // Répartir les pourcentages équitablement
            if (types.length > 0) {
              const baseValue = Math.floor(100 / types.length);
              let remaining = 100;
              types.forEach((type, i) => {
                if (i === types.length - 1) {
                  config.typeChances[type] = remaining;
                } else {
                  config.typeChances[type] = baseValue;
                  remaining -= baseValue;
                }
              });
            }

            // Valeurs par défaut pour les raretés
            rarities.forEach((rarity) => {
              const rarityLower = rarity.toLowerCase();

              if (
                rarityLower === "commun" ||
                rarityLower === "neutre" ||
                rarityLower === "variable"
              ) {
                config.itemsPerRarity[rarity] = 5;
              } else if (rarityLower.includes("peu commun")) {
                config.itemsPerRarity[rarity] = 3;
              } else if (rarityLower.includes("rare")) {
                config.itemsPerRarity[rarity] = 1;
              } else {
                config.itemsPerRarity[rarity] = 0;
              }
            });

            setUiState((prev) => ({
              ...prev,
              totalPercentage: 100,
            }));
          }
        } else {
          // Pas de preset spécifié, utiliser une configuration par défaut
          // Répartir les pourcentages équitablement
          if (types.length > 0) {
            const baseValue = Math.floor(100 / types.length);
            let remaining = 100;
            types.forEach((type, i) => {
              if (i === types.length - 1) {
                config.typeChances[type] = remaining;
              } else {
                config.typeChances[type] = baseValue;
                remaining -= baseValue;
              }
            });
          }

          // Valeurs par défaut pour les raretés
          rarities.forEach((rarity) => {
            const rarityLower = rarity.toLowerCase();

            if (
              rarityLower === "commun" ||
              rarityLower === "neutre" ||
              rarityLower === "variable"
            ) {
              config.itemsPerRarity[rarity] = 5;
            } else if (rarityLower.includes("peu commun")) {
              config.itemsPerRarity[rarity] = 3;
            } else if (rarityLower.includes("rare")) {
              config.itemsPerRarity[rarity] = 1;
            } else {
              config.itemsPerRarity[rarity] = 0;
            }
          });

          setUiState((prev) => ({
            ...prev,
            totalPercentage: 100,
          }));
        }

        setShopConfig(config);
        setUiState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
        setMessages({
          error:
            "Erreur lors du chargement: " +
            (error.message || "Erreur inconnue"),
          success: "",
        });
        setUiState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    initialize();
  }, [presetId]);

  // Gestionnaire de sélection de preset
  const handlePresetSelect = async (preset) => {
    if (!preset) return;

    try {
      const { config, percentage } = await applyPreset(preset);

      setShopConfig(config);
      setUiState((prev) => ({
        ...prev,
        showPresetSelector: false,
        totalPercentage: percentage,
      }));
    } catch (error) {
      console.error("Erreur lors de l'application du preset:", error);
      setMessages({
        error: "Erreur lors de l'application du preset: " + error.message,
        success: "",
      });
    }
  };

  // Mise à jour de la configuration
  const updateShopConfig = (newConfig, newPercentage) => {
    setShopConfig(newConfig);
    setUiState((prev) => ({ ...prev, totalPercentage: newPercentage }));
  };

  // Génération de la boutique
  const generateShop = async () => {
    if (uiState.totalPercentage !== 100) {
      setMessages({
        error:
          "Les pourcentages doivent totaliser 100%. Utilisez 'Normaliser'.",
        success: "",
      });
      return;
    }

    setUiState((prev) => ({ ...prev, isGenerating: true }));
    setMessages({ error: "", success: "" });
    setShopItems([]);

    try {
      const items = await generateShopItems(shopConfig);

      setShopItems(items);
      setUiState((prev) => ({
        ...prev,
        isGenerating: false,
        showItemSelector: true,
      }));

      setMessages({ success: "Boutique générée avec succès !", error: "" });
      setTimeout(() => setMessages({ success: "", error: "" }), 3000);

      // Scroll vers la section générée
      setTimeout(() => {
        const shopSection = document.getElementById("generated-shop-section");
        if (shopSection) shopSection.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (error) {
      console.error("Erreur de génération:", error);
      setMessages({
        error: "Erreur lors de la génération: " + error.message,
        success: "",
      });
      setUiState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  // Sauvegarde de la boutique
  const saveShop = async () => {
    if (!shopDetails.name.trim()) {
      setMessages({
        error: "Le nom de la boutique est obligatoire",
        success: "",
      });

      // Animation du champ nom
      const shopNameField = document.getElementById("shop-name-field");
      if (shopNameField) {
        shopNameField.classList.add("shake-animation");
        shopNameField.focus();
        setTimeout(
          () => shopNameField.classList.remove("shake-animation"),
          500
        );
      }

      return;
    }

    if (shopItems.length === 0) {
      setMessages({ error: "Aucun objet à sauvegarder", success: "" });
      return;
    }

    setUiState((prev) => ({ ...prev, isSaving: true }));
    setMessages({ error: "", success: "" });

    try {
      await saveShopToDatabase(
        shopDetails.name,
        shopDetails.description,
        shopItems
      );

      setMessages({ success: "Boutique sauvegardée avec succès", error: "" });

      // Redirection après un court délai
      setTimeout(() => router.push("/shops"), 1000);
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
      setMessages({
        error: "Erreur lors de la sauvegarde: " + error.message,
        success: "",
      });
    } finally {
      setUiState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // Toggle du sélecteur de présets
  const togglePresetSelector = () => {
    setUiState((prev) => ({
      ...prev,
      showPresetSelector: !prev.showPresetSelector,
    }));
  };

  // Toggle du sélecteur d'objets
  const toggleItemSelector = () => {
    setUiState((prev) => ({
      ...prev,
      showItemSelector: !prev.showItemSelector,
    }));
  };

  // Mise à jour des détails de la boutique
  const updateShopDetails = (field, value) => {
    setShopDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Gestion des objets de la boutique
  const addItemToShop = (item) => {
    if (!shopItems.some((existingItem) => existingItem.IDX === item.IDX)) {
      setShopItems([...shopItems, item]);
      setMessages({ success: "Objet ajouté à la boutique", error: "" });
      setTimeout(() => setMessages({ success: "", error: "" }), 2000);
    } else {
      setMessages({
        error: "Cet objet est déjà dans la boutique",
        success: "",
      });
      setTimeout(() => setMessages({ error: "", success: "" }), 2000);
    }
  };

  const removeItemFromShop = (itemId) => {
    setShopItems(shopItems.filter((item) => item.IDX !== itemId));
    setMessages({ success: "Objet retiré de la boutique", error: "" });
    setTimeout(() => setMessages({ success: "", error: "" }), 2000);
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
        <StatusMessage error={messages.error} success={messages.success} />

        {/* Sélecteur de présets */}
        {uiState.showPresetSelector ? (
          <div className="mb-6">
            <PresetSelector onPresetSelect={handlePresetSelect} />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={togglePresetSelector}
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
              onClick={togglePresetSelector}
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

        {/* Section de configuration */}
        <ShopConfigSection
          shopConfig={shopConfig}
          metadata={metadata}
          uiState={uiState}
          onConfigChange={updateShopConfig}
          onGenerate={generateShop}
        />

        {/* Section des objets générés */}
        {shopItems.length > 0 && (
          <ShopGeneratedSection
            shopItems={shopItems}
            shopDetails={shopDetails}
            uiState={uiState}
            onUpdateDetails={updateShopDetails}
            onSave={saveShop}
            onAddItem={addItemToShop}
            onRemoveItem={removeItemFromShop}
            onToggleItemSelector={toggleItemSelector}
          />
        )}
      </div>
    </div>
  );
}
