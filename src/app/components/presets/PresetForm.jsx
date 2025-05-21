"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWealthLevels, getShopTypes } from "../../lib/presetUtils";

export default function PresetForm({ preset, isEditMode = false }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalPercentage, setTotalPercentage] = useState(0);

  // Options pour les sélecteurs
  const wealthLevels = getWealthLevels();
  const shopTypes = getShopTypes();

  // État du formulaire
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    wealthLevel: "standard",
    shopType: "général",
    typeChances: {},
    rarityConfig: {},
  });

  // Types et raretés disponibles
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableRarities, setAvailableRarities] = useState([]);

  // Debug - Afficher l'état actuel du formulaire et du preset
  useEffect(() => {
    if (isEditMode && preset) {
      console.log("Mode édition avec preset:", preset);
    }
    console.log("État du formulaire:", formData);
  }, [isEditMode, preset, formData]);

  // Chargement des types et raretés au montage du composant
  useEffect(() => {
    async function loadTypesAndRarities() {
      try {
        console.log("Chargement des types et raretés...");
        const typesResponse = await fetch("/api/items?action=types");
        const raritiesResponse = await fetch("/api/items?action=rarities");

        if (!typesResponse.ok || !raritiesResponse.ok) {
          throw new Error("Erreur lors du chargement des types et raretés");
        }

        const typesData = await typesResponse.json();
        const raritiesData = await raritiesResponse.json();

        console.log("Types chargés:", typesData);
        console.log("Raretés chargées:", raritiesData);

        // S'assurer que nous avons bien des tableaux
        const types = Array.isArray(typesData.types)
          ? typesData.types
          : Array.isArray(typesData)
          ? typesData
          : [];

        const rarities = Array.isArray(raritiesData.rarities)
          ? raritiesData.rarities
          : Array.isArray(raritiesData)
          ? raritiesData
          : [];

        setAvailableTypes(types);
        setAvailableRarities(rarities);

        // Initialiser les distributions par défaut
        const initialTypeChances = {};
        types.forEach((type) => {
          initialTypeChances[type] = 0;
        });

        const initialRarityConfig = {};
        rarities.forEach((rarity) => {
          initialRarityConfig[rarity] = 0;
        });

        // Mettre à jour le formulaire avec les distributions par défaut
        // SEULEMENT si nous ne sommes pas en mode édition
        // pour éviter d'écraser les données existantes
        if (!isEditMode || !preset) {
          setFormData((prev) => ({
            ...prev,
            typeChances: { ...initialTypeChances },
            rarityConfig: { ...initialRarityConfig },
          }));
        }
      } catch (err) {
        console.error("Erreur lors du chargement des types et raretés:", err);
        setError(
          "Impossible de charger les données nécessaires. Veuillez réessayer."
        );
      }
    }

    loadTypesAndRarities();
  }, [isEditMode, preset]);

  // Si en mode édition, charger les données du preset
  useEffect(() => {
    if (isEditMode && preset) {
      console.log("Chargement des données du preset pour édition:", preset);

      // Assurons-nous que nous avons bien JSON.parse les données si elles sont sous forme de string
      let typeChances = preset.typeChances;
      let rarityConfig = preset.rarityConfig;

      // Si les données sont des chaînes JSON, on les parse
      if (typeof typeChances === "string") {
        try {
          typeChances = JSON.parse(typeChances);
        } catch (e) {
          console.error("Erreur lors du parsing de typeChances:", e);
          typeChances = {};
        }
      }

      if (typeof rarityConfig === "string") {
        try {
          rarityConfig = JSON.parse(rarityConfig);
        } catch (e) {
          console.error("Erreur lors du parsing de rarityConfig:", e);
          rarityConfig = {};
        }
      }

      // S'assurer que toutes les valeurs sont des nombres
      if (typeChances) {
        Object.keys(typeChances).forEach((key) => {
          typeChances[key] = parseInt(typeChances[key]) || 0;
        });
      }

      if (rarityConfig) {
        Object.keys(rarityConfig).forEach((key) => {
          rarityConfig[key] = parseInt(rarityConfig[key]) || 0;
        });
      }

      // Normaliser les pourcentages pour qu'ils totalisent 100%
      let total = 0;
      if (typeChances) {
        total = Object.values(typeChances).reduce(
          (sum, value) => sum + (parseInt(value) || 0),
          0
        );

        if (total !== 100 && total > 0 && Object.keys(typeChances).length > 0) {
          console.log(
            `Le total des pourcentages est ${total}%, normalisation à 100%`
          );

          // Normaliser les valeurs
          const factor = 100 / total;
          let newTotal = 0;
          const keys = Object.keys(typeChances);

          // Ajuster toutes les valeurs sauf la dernière
          for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const adjustedValue = Math.round(typeChances[key] * factor);
            typeChances[key] = adjustedValue;
            newTotal += adjustedValue;
          }

          // Ajuster la dernière valeur pour avoir exactement 100%
          const lastKey = keys[keys.length - 1];
          typeChances[lastKey] = 100 - newTotal;

          // Vérification finale
          const finalTotal = Object.values(typeChances).reduce(
            (sum, val) => sum + val,
            0
          );
          console.log(`Après normalisation, le total est de ${finalTotal}%`);
        }
      }

      // Création d'une copie complète des données du preset avec les valeurs normalisées
      const presetData = {
        name: preset.name || "",
        description: preset.description || "",
        wealthLevel: preset.wealthLevel || "standard",
        shopType: preset.shopType || "général",
        typeChances: typeChances ? { ...typeChances } : {},
        rarityConfig: rarityConfig ? { ...rarityConfig } : {},
      };

      console.log("Données formatées pour le formulaire:", presetData);
      setFormData(presetData);

      // Mettre à jour le total des pourcentages avec la valeur normalisée
      const calculatedTotal = Object.values(typeChances || {}).reduce(
        (sum, value) => sum + (parseInt(value) || 0),
        0
      );
      setTotalPercentage(calculatedTotal);
    }
  }, [isEditMode, preset]);

  // Gestionnaire de changement de champ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Gestionnaire de changement pour les pourcentages de types
  const handleTypeChanceChange = (type, value) => {
    // Si la valeur est une chaîne vide, la garder telle quelle
    // Sinon, la convertir en nombre (0 si la conversion échoue)
    const parsedValue = value === "" ? "" : parseInt(value, 10) || 0;

    const newTypeChances = {
      ...formData.typeChances,
      [type]: parsedValue,
    };

    setFormData({
      ...formData,
      typeChances: newTypeChances,
    });

    // Calculer le nouveau pourcentage total, en ignorant les champs vides
    const total = Object.values(newTypeChances).reduce(
      (sum, val) => sum + (val === "" ? 0 : parseInt(val) || 0),
      0
    );

    setTotalPercentage(total);

    // Log pour débogage
    console.log(`Nouveau total après changement de ${type}: ${total}%`);
  };

  // Gestionnaire de changement pour les configurations de rareté
  const handleRarityConfigChange = (rarity, value) => {
    // Si la valeur est une chaîne vide, la garder telle quelle
    // Sinon, la convertir en nombre (0 si la conversion échoue)
    const parsedValue = value === "" ? "" : parseInt(value, 10) || 0;

    setFormData({
      ...formData,
      rarityConfig: {
        ...formData.rarityConfig,
        [rarity]: parsedValue,
      },
    });
  };

  // Normalisation des pourcentages pour qu'ils totalisent 100%
  const normalizePercentages = () => {
    if (totalPercentage === 0) return;

    const newTypeChances = { ...formData.typeChances };

    // Convertir les chaînes vides en 0 pour la normalisation
    Object.keys(newTypeChances).forEach((key) => {
      if (newTypeChances[key] === "") {
        newTypeChances[key] = 0;
      }
    });

    const factor = 100 / totalPercentage;
    const keys = Object.keys(newTypeChances);

    if (keys.length === 0) return;

    let newTotal = 0;

    // Première passe: ajuster toutes les valeurs sauf la dernière
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const adjustedValue = Math.round((newTypeChances[key] || 0) * factor);
      newTypeChances[key] = adjustedValue;
      newTotal += adjustedValue;
    }

    // Ajuster la dernière valeur pour avoir exactement 100%
    const lastKey = keys[keys.length - 1];
    newTypeChances[lastKey] = 100 - newTotal;

    // Vérification finale
    const finalTotal = Object.values(newTypeChances).reduce(
      (sum, val) => sum + val,
      0
    );
    console.log(`Après normalisation, le total est de ${finalTotal}%`);

    setFormData({
      ...formData,
      typeChances: newTypeChances,
    });

    setTotalPercentage(100);
  };

  // Génération aléatoire des pourcentages de types
  const randomizeTypeChances = () => {
    if (availableTypes.length === 0) return;

    const newTypeChances = { ...formData.typeChances };

    // Générer des valeurs aléatoires pour chaque type
    let total = 0;
    availableTypes.forEach((type) => {
      newTypeChances[type] = Math.floor(Math.random() * 30) + 5; // Entre 5 et 34
      total += newTypeChances[type];
    });

    // Normaliser pour obtenir un total de 100%
    availableTypes.forEach((type) => {
      newTypeChances[type] = Math.floor((newTypeChances[type] / total) * 100);
    });

    // Ajuster pour obtenir exactement 100%
    let newTotal = Object.values(newTypeChances).reduce(
      (sum, val) => sum + val,
      0
    );

    if (newTotal !== 100 && availableTypes.length > 0) {
      // Distribuer l'excédent ou le déficit sur toutes les valeurs
      let diff = 100 - newTotal;

      // Si le déficit/excédent est trop grand, répartir sur plusieurs types
      if (Math.abs(diff) > 5 && availableTypes.length > 1) {
        const adjustmentPerType = Math.floor(diff / availableTypes.length);
        let remaining = diff;

        for (let i = 0; i < availableTypes.length - 1; i++) {
          const type = availableTypes[i];
          const adjustment = Math.min(adjustmentPerType, remaining);
          newTypeChances[type] += adjustment;
          remaining -= adjustment;
        }

        // Ajuster le dernier type avec ce qui reste
        newTypeChances[availableTypes[availableTypes.length - 1]] += remaining;
      } else {
        // Si la différence est faible ou il n'y a qu'un seul type, l'ajouter au premier
        newTypeChances[availableTypes[0]] += diff;
      }
    }

    setFormData({
      ...formData,
      typeChances: newTypeChances,
    });

    // Calculer le nouveau total réel
    const finalTotal = Object.values(newTypeChances).reduce(
      (sum, val) => sum + val,
      0
    );
    setTotalPercentage(finalTotal);
    console.log(`Après randomization, le total est de ${finalTotal}%`);
  };

  // Génération aléatoire des configurations de rareté
  const randomizeRarityConfig = () => {
    if (availableRarities.length === 0) return;

    const newRarityConfig = { ...formData.rarityConfig };

    // En fonction du niveau de richesse, ajuster les valeurs
    const wealthFactor =
      {
        pauvre: 0.5, // Moins d'objets, surtout communs
        standard: 1, // Valeurs normales
        luxueux: 2, // Beaucoup plus d'objets rares
      }[formData.wealthLevel] || 1;

    availableRarities.forEach((rarity) => {
      // Plus la rareté est élevée, moins il y aura d'objets
      if (
        (rarity.toLowerCase().includes("commun") &&
          rarity.toLowerCase() !== "peu commun") ||
        rarity.toLowerCase() === "neutre" ||
        rarity.toLowerCase() === "variable"
      ) {
        newRarityConfig[rarity] = Math.floor(
          (Math.random() * 6 + 3) * wealthFactor
        ); // 3-8 pour Commun, Neutre et Variable
      } else if (rarity.toLowerCase().includes("peu commun")) {
        newRarityConfig[rarity] = Math.floor(
          (Math.random() * 4 + 1) * wealthFactor
        ); // 1-4
      } else if (rarity.toLowerCase().includes("rare")) {
        newRarityConfig[rarity] = Math.floor(Math.random() * 3 * wealthFactor); // 0-2
      } else if (rarity.toLowerCase().includes("très rare")) {
        const chance = wealthFactor >= 1.5 ? 0.3 : 0.1; // Plus de chance avec richesse élevée
        newRarityConfig[rarity] = Math.random() < chance ? 1 : 0;
      } else if (rarity.toLowerCase().includes("légendaire")) {
        const chance = wealthFactor >= 2 ? 0.2 : 0.05; // Beaucoup plus de chance avec richesse élevée
        newRarityConfig[rarity] = Math.random() < chance ? 1 : 0;
      } else {
        newRarityConfig[rarity] = Math.floor(Math.random() * 3 * wealthFactor); // 0-2
      }
    });

    setFormData({
      ...formData,
      rarityConfig: newRarityConfig,
    });
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier que le total des pourcentages est 100%
    if (totalPercentage !== 100) {
      setError(
        "Les pourcentages de types doivent totaliser 100%. Utilisez le bouton 'Normaliser'."
      );
      return;
    }

    // Convertir toutes les chaînes vides en 0 avant la soumission
    const finalTypeChances = { ...formData.typeChances };
    Object.keys(finalTypeChances).forEach((key) => {
      if (finalTypeChances[key] === "") {
        finalTypeChances[key] = 0;
      }
    });

    const finalRarityConfig = { ...formData.rarityConfig };
    Object.keys(finalRarityConfig).forEach((key) => {
      if (finalRarityConfig[key] === "") {
        finalRarityConfig[key] = 0;
      }
    });

    // Vérifier que le formulaire est complet
    if (!formData.name.trim()) {
      setError("Le nom du preset est obligatoire");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    // Préparer les données finales avec les valeurs converties
    const finalFormData = {
      ...formData,
      typeChances: finalTypeChances,
      rarityConfig: finalRarityConfig,
    };

    console.log("Données à envoyer:", finalFormData);

    try {
      const apiUrl = isEditMode ? `/api/presets/${preset.id}` : "/api/presets";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log("Réponse API:", data);

      setSuccess(
        isEditMode ? "Preset mis à jour avec succès" : "Preset créé avec succès"
      );

      // Rediriger vers la liste des présets après un court délai
      setTimeout(() => {
        router.push("/presets");
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(err.message || "Une erreur est survenue lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md border border-gray-200"
    >
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <h1 className="text-xl font-medium text-gray-800">
          {isEditMode ? "Modifier le preset" : "Créer un nouveau preset"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode
            ? "Modifiez les paramètres du preset existant"
            : "Configurez un nouveau preset pour générer des boutiques rapidement"}
        </p>
      </div>

      <div className="p-4">
        {/* Messages de statut */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom du preset *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="wealthLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Niveau de richesse *
            </label>
            <select
              id="wealthLevel"
              name="wealthLevel"
              value={formData.wealthLevel}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              {wealthLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="shopType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type de boutique *
            </label>
            <select
              id="shopType"
              name="shopType"
              value={formData.shopType}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              {shopTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Configuration des Types */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-700">
              Distribution des types d'objets
            </h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={randomizeTypeChances}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                Aléatoire
              </button>
              <button
                type="button"
                onClick={normalizePercentages}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
                Normaliser
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              Définissez la répartition des types d'objets en pourcentage. Le
              total doit être égal à 100%.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableTypes.map((type) => (
                <div key={type} className="flex items-center">
                  <label
                    htmlFor={`type-${type}`}
                    className="block text-sm font-medium text-gray-700 mr-2 flex-grow"
                  >
                    {type}
                  </label>
                  <div className="relative w-20">
                    <input
                      type="number"
                      id={`type-${type}`}
                      value={formData.typeChances[type] || ""} // Utilisez "" au lieu de 0
                      onChange={(e) =>
                        handleTypeChanceChange(type, e.target.value)
                      }
                      onFocus={(e) => {
                        // Quand le champ obtient le focus, si la valeur est 0, la remplacer par ""
                        if (formData.typeChances[type] === 0) {
                          const newTypeChances = { ...formData.typeChances };
                          newTypeChances[type] = "";
                          setFormData({
                            ...formData,
                            typeChances: newTypeChances,
                          });
                        }
                      }}
                      onBlur={(e) => {
                        // Quand le champ perd le focus, si la valeur est vide, la remettre à 0
                        if (e.target.value === "") {
                          handleTypeChanceChange(type, 0);
                        }
                      }}
                      min="0"
                      max="100"
                      className="block w-full pl-2 pr-8 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <p
                className={`text-sm font-medium ${
                  totalPercentage === 100 ? "text-green-600" : "text-red-600"
                }`}
              >
                Total: {totalPercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Configuration des Raretés */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-700">
              Nombre d'objets par rareté
            </h3>
            <button
              type="button"
              onClick={randomizeRarityConfig}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              Générer aléatoirement
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              Définissez le nombre d'objets par niveau de rareté à inclure dans
              la boutique.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableRarities.map((rarity) => (
                <div key={rarity} className="flex items-center">
                  <label
                    htmlFor={`rarity-${rarity}`}
                    className="block text-sm font-medium text-gray-700 mr-2 flex-grow"
                  >
                    {rarity}
                  </label>
                  <input
                    type="number"
                    id={`rarity-${rarity}`}
                    value={formData.rarityConfig[rarity] || ""} // Utilisez "" au lieu de 0
                    onChange={(e) =>
                      handleRarityConfigChange(rarity, e.target.value)
                    }
                    onFocus={(e) => {
                      // Quand le champ obtient le focus, si la valeur est 0, la remplacer par ""
                      if (formData.rarityConfig[rarity] === 0) {
                        const newRarityConfig = { ...formData.rarityConfig };
                        newRarityConfig[rarity] = "";
                        setFormData({
                          ...formData,
                          rarityConfig: newRarityConfig,
                        });
                      }
                    }}
                    onBlur={(e) => {
                      // Quand le champ perd le focus, si la valeur est vide, la remettre à 0
                      if (e.target.value === "") {
                        handleRarityConfigChange(rarity, 0);
                      }
                    }}
                    min="0"
                    className="block w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push("/presets")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                {isEditMode ? "Mise à jour..." : "Création..."}
              </>
            ) : (
              <>{isEditMode ? "Mettre à jour" : "Créer le preset"}</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
