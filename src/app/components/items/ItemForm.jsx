"use client";
// components/items/ItemForm.jsx
import { useState, useEffect } from "react";
import Link from "next/link";
import ErrorMessage from "../ui/ErrorMessage";

/**
 * Composant de formulaire réutilisable pour ajouter/modifier un objet
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.initialData - Données initiales de l'objet
 * @param {Array} props.types - Liste des types disponibles
 * @param {Array} props.rarities - Liste des raretés disponibles
 * @param {Function} props.onSubmit - Fonction appelée lors de la soumission
 * @param {string} props.submitLabel - Texte du bouton de soumission
 * @param {boolean} props.isSubmitting - État de soumission du formulaire
 * @param {string} props.errorMessage - Message d'erreur général à afficher
 */
export default function ItemForm({
  initialData = {
    name: "",
    type: "",
    subType: "",
    proficiency: "",
    rarity: "",
    characteristics: "",
    value: "",
    additionalInfo: "",
    weight: "",
    source: "",
  },
  types = [],
  rarities = [],
  onSubmit,
  submitLabel = "Enregistrer",
  isSubmitting = false,
  errorMessage = "",
}) {
  // Vérification défensive pour les types et raretés
  const safeTypes = Array.isArray(types) ? types : [];
  const safeRarities = Array.isArray(rarities) ? rarities : [];

  // Afficher un log en développement si les props ne sont pas des tableaux
  useEffect(() => {
    if (!Array.isArray(types)) {
      console.error("ItemForm: La prop 'types' n'est pas un tableau:", types);
    }
    if (!Array.isArray(rarities)) {
      console.error(
        "ItemForm: La prop 'rarities' n'est pas un tableau:",
        rarities
      );
    }
  }, [types, rarities]);

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur pour ce champ s'il est rempli
    if (errors[name] && value.trim()) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Vérification des champs obligatoires
    if (!formData.name.trim()) newErrors.name = "Le nom est obligatoire";
    if (!formData.type.trim()) newErrors.type = "Le type est obligatoire";
    if (!formData.rarity.trim()) newErrors.rarity = "La rareté est obligatoire";
    if (!formData.source.trim()) newErrors.source = "La source est obligatoire";

    // Validation de la valeur (doit être un nombre)
    if (formData.value && isNaN(parseFloat(formData.value.replace(",", ".")))) {
      newErrors.value = "La valeur doit être un nombre";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    // Préparer les données pour l'API
    const apiData = {
      name: formData.name,
      type: formData.type,
      subType: formData.subType || null,
      proficiency: formData.proficiency || null,
      rarity: formData.rarity,
      characteristics: formData.characteristics || null,
      value: formData.value ? formData.value.replace(",", ".") : null,
      additionalInfo: formData.additionalInfo || null,
      weight: formData.weight || null,
      source: formData.source,
    };

    // Appeler la fonction de soumission passée en props
    onSubmit(apiData);
  };

  return (
    <div className="p-6">
      {errorMessage && (
        <ErrorMessage message={errorMessage} title="Erreur" className="mb-6" />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block mb-2 font-medium text-gray-700"
            >
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={`px-3 py-2 w-full rounded-md border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
              placeholder="Nom de l'objet"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className="block mb-2 font-medium text-gray-700"
            >
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`px-3 py-2 w-full rounded-md border ${
                errors.type ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 appearance-none bg-white`}
            >
              <option value="">Sélectionner un type</option>
              {Array.isArray(safeTypes) &&
                safeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="subType"
              className="block mb-2 font-medium text-gray-700"
            >
              Sous-type
            </label>
            <input
              type="text"
              name="subType"
              id="subType"
              value={formData.subType}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Sous-type (facultatif)"
            />
          </div>

          <div>
            <label
              htmlFor="proficiency"
              className="block mb-2 font-medium text-gray-700"
            >
              Maîtrise
            </label>
            <input
              type="text"
              name="proficiency"
              id="proficiency"
              value={formData.proficiency}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Maîtrise (facultatif)"
            />
          </div>

          <div>
            <label
              htmlFor="rarity"
              className="block mb-2 font-medium text-gray-700"
            >
              Rareté <span className="text-red-500">*</span>
            </label>
            <select
              id="rarity"
              name="rarity"
              value={formData.rarity}
              onChange={handleChange}
              className={`px-3 py-2 w-full rounded-md border ${
                errors.rarity ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 appearance-none bg-white`}
            >
              <option value="">Sélectionner une rareté</option>
              {Array.isArray(safeRarities) &&
                safeRarities.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity}
                  </option>
                ))}
            </select>
            {errors.rarity && (
              <p className="mt-1 text-sm text-red-600">{errors.rarity}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="value"
              className="block mb-2 font-medium text-gray-700"
            >
              Valeur (PO)
            </label>
            <input
              type="text"
              name="value"
              id="value"
              value={formData.value}
              onChange={handleChange}
              className={`px-3 py-2 w-full rounded-md border ${
                errors.value ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
              placeholder="Valeur en pièces d'or"
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="weight"
              className="block mb-2 font-medium text-gray-700"
            >
              Poids
            </label>
            <input
              type="text"
              name="weight"
              id="weight"
              value={formData.weight}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Poids (facultatif)"
            />
          </div>

          <div>
            <label
              htmlFor="source"
              className="block mb-2 font-medium text-gray-700"
            >
              Source <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="source"
              id="source"
              value={formData.source}
              onChange={handleChange}
              className={`px-3 py-2 w-full rounded-md border ${
                errors.source ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
              placeholder="Source (ex: Manuel des joueurs)"
            />
            {errors.source && (
              <p className="mt-1 text-sm text-red-600">{errors.source}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="characteristics"
              className="block mb-2 font-medium text-gray-700"
            >
              Caractéristiques
            </label>
            <textarea
              id="characteristics"
              name="characteristics"
              rows={3}
              value={formData.characteristics}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Décrivez les caractéristiques de l'objet..."
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="additionalInfo"
              className="block mb-2 font-medium text-gray-700"
            >
              Informations supplémentaires
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={3}
              value={formData.additionalInfo}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Ajoutez des informations supplémentaires..."
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end space-x-3">
          <Link href="/items">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-5 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-all flex items-center"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Annuler
            </button>
          </Link>
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                Enregistrement...
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
