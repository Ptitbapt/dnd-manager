"use client";
// app/items/add/page.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddItem() {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
  });

  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chargement des types et raretés
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [typesResponse, raritiesResponse] = await Promise.all([
          fetch("/api/items?action=types"),
          fetch("/api/items?action=rarities"),
        ]);

        if (typesResponse.ok && raritiesResponse.ok) {
          const typesData = await typesResponse.json();
          const raritiesData = await raritiesResponse.json();

          setTypes(typesData);
          setRarities(raritiesData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des options:", error);
      }
    }

    fetchOptions();
  }, []);

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
    if (formData.value && isNaN(Number(formData.value))) {
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

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Redirection vers la liste des objets après l'ajout
        router.push("/items");
      } else {
        const data = await response.json();
        setErrors({
          general: data.error || "Erreur lors de l'ajout de l'objet",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'objet:", error);
      setErrors({ general: "Une erreur s'est produite" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="medieval-title">Ajouter un Objet</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ajouter un nouvel objet à votre base de données
        </p>
      </div>

      <div className="card-body">
        {errors.general && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="form-label">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="form-label">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`form-select ${errors.type ? "border-red-500" : ""}`}
              >
                <option value="">Sélectionner un type</option>
                {types.map((type) => (
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
              <label htmlFor="subType" className="form-label">
                Sous-type
              </label>
              <input
                type="text"
                name="subType"
                id="subType"
                value={formData.subType}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="proficiency" className="form-label">
                Maîtrise
              </label>
              <input
                type="text"
                name="proficiency"
                id="proficiency"
                value={formData.proficiency}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="rarity" className="form-label">
                Rareté <span className="text-red-500">*</span>
              </label>
              <select
                id="rarity"
                name="rarity"
                value={formData.rarity}
                onChange={handleChange}
                className={`form-select ${
                  errors.rarity ? "border-red-500" : ""
                }`}
              >
                <option value="">Sélectionner une rareté</option>
                {rarities.map((rarity) => (
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
              <label htmlFor="value" className="form-label">
                Valeur (PO)
              </label>
              <input
                type="text"
                name="value"
                id="value"
                value={formData.value}
                onChange={handleChange}
                className={`form-input ${errors.value ? "border-red-500" : ""}`}
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value}</p>
              )}
            </div>

            <div>
              <label htmlFor="weight" className="form-label">
                Poids
              </label>
              <input
                type="text"
                name="weight"
                id="weight"
                value={formData.weight}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="source" className="form-label">
                Source <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="source"
                id="source"
                value={formData.source}
                onChange={handleChange}
                className={`form-input ${
                  errors.source ? "border-red-500" : ""
                }`}
              />
              {errors.source && (
                <p className="mt-1 text-sm text-red-600">{errors.source}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="characteristics" className="form-label">
                Caractéristiques
              </label>
              <textarea
                id="characteristics"
                name="characteristics"
                rows={3}
                value={formData.characteristics}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="additionalInfo" className="form-label">
                Informations supplémentaires
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                rows={3}
                value={formData.additionalInfo}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <Link href="/items" className="btn-secondary">
              Annuler
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
