"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ShopDetailsForm({
  shopName,
  shopDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  isSaving,
}) {
  const [showNameError, setShowNameError] = useState(false);

  // Gérer l'affichage/masquage de l'erreur pour le nom manquant
  useEffect(() => {
    // Si le nom est fourni, on masque l'erreur
    setShowNameError(!shopName || shopName.trim() === "");
  }, [shopName]);

  const handleSave = () => {
    if (!shopName || shopName.trim() === "") {
      setShowNameError(true);

      // Focus sur le champ de nom avec une animation
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

    onSave();
  };

  return (
    <div className="bg-white mb-6 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Détails de la boutique
      </h3>

      <div className="mb-4">
        <label
          htmlFor="shop-name-field"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nom de la boutique <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="shop-name-field"
            type="text"
            value={shopName || ""}
            onChange={(e) => onNameChange(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              showNameError ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="La Hache Brisée"
          />
          {showNameError && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        {showNameError && (
          <div className="mt-2 rounded-md bg-red-50 p-3 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Le nom de la boutique est requis
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  Veuillez saisir un nom pour pouvoir sauvegarder la boutique.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="shop-description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="shop-description"
          value={shopDescription || ""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Une description de cette boutique (ambiance, apparence, vendeur...)"
        ></textarea>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
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
              Sauvegarde en cours...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
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
  );
}
