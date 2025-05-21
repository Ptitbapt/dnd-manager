"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWealthLevels, getShopTypes } from "../../lib/presetUtils";
import PresetHeader from "./PresetHeader";
import PresetBasicInfo from "./PresetBasicInfo";
import TypeDistribution from "./TypeDistribution";
import RarityDistribution from "./RarityDistribution";
import FormButtons from "./FormButtons";
import StatusMessage from "../shops/StatusMessage";

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

  // Tout effacer - Réinitialiser toutes les valeurs à 0
  const clearAllValues = () => {
    if (confirm("Êtes-vous sûr de vouloir effacer toutes les valeurs?")) {
      // Réinitialiser les pourcentages de types
      const clearedTypeChances = {};
      availableTypes.forEach((type) => {
        clearedTypeChances[type] = 0;
      });

      // Réinitialiser les configurations de rareté
      const clearedRarityConfig = {};
      availableRarities.forEach((rarity) => {
        clearedRarityConfig[rarity] = 0;
      });

      setFormData({
        ...formData,
        typeChances: clearedTypeChances,
        rarityConfig: clearedRarityConfig,
      });

      setTotalPercentage(0);
      console.log("Toutes les valeurs ont été réinitialisées à 0");
    }
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
      <PresetHeader isEditMode={isEditMode} />

      <div className="p-4">
        {/* Utiliser le composant StatusMessage existant */}
        <StatusMessage error={error} success={success} />

        <PresetBasicInfo
          formData={formData}
          handleChange={handleChange}
          wealthLevels={wealthLevels}
          shopTypes={shopTypes}
        />

        <TypeDistribution
          availableTypes={availableTypes}
          formData={formData}
          handleTypeChanceChange={handleTypeChanceChange}
          clearAllValues={clearAllValues}
          randomizeTypeChances={randomizeTypeChances}
          normalizePercentages={normalizePercentages}
          totalPercentage={totalPercentage}
        />

        <RarityDistribution
          availableRarities={availableRarities}
          formData={formData}
          handleRarityConfigChange={handleRarityConfigChange}
          clearAllValues={clearAllValues}
          randomizeRarityConfig={randomizeRarityConfig}
        />

        <FormButtons
          router={router}
          isLoading={isLoading}
          isEditMode={isEditMode}
        />
      </div>
    </form>
  );
}
