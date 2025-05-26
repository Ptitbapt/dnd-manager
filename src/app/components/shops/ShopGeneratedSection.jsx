"use client";

import React from "react";
import ShopDetailsForm from "./ShopDetailsForm";
import ShopItemsTable from "./ShopItemsTable";
import ItemSelector from "./ItemSelector";

/**
 * Section des objets générés pour la boutique
 */
export default function ShopGeneratedSection({
  shopItems,
  shopDetails,
  uiState,
  onUpdateDetails,
  onSave,
  onAddItem,
  onRemoveItem,
  onUpdateItem, // Nouvelle prop pour gérer les modifications d'items
  onToggleItemSelector,
}) {
  const { isSaving, showItemSelector } = uiState;

  // Gestionnaires de mises à jour des détails
  const handleNameChange = (value) => {
    onUpdateDetails("name", value);
  };

  const handleDescriptionChange = (value) => {
    onUpdateDetails("description", value);
  };

  return (
    <div id="generated-shop-section" className="animate-fadeIn mt-8">
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

      {/* Message d'information sur l'édition */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0"
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
          <div className="text-sm text-blue-700">
            <p className="font-medium">Édition des objets</p>
            <p className="mt-1">
              Cliquez sur les valeurs (prix, poids, caractéristiques) pour les
              modifier temporairement dans cette boutique sans affecter la base
              de données.
            </p>
          </div>
        </div>
      </div>

      <ShopDetailsForm
        shopName={shopDetails.name}
        shopDescription={shopDetails.description}
        onNameChange={handleNameChange}
        onDescriptionChange={handleDescriptionChange}
        onSave={onSave}
        isSaving={isSaving}
      />

      <ShopItemsTable
        shopItems={shopItems}
        onRemoveItem={onRemoveItem}
        onUpdateItem={onUpdateItem}
      />

      {/* Toggle pour le sélecteur d'objets */}
      <div className="mt-6 mb-2">
        <button
          type="button"
          onClick={onToggleItemSelector}
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
              Recherchez et ajoutez des objets supplémentaires à votre boutique
            </p>
          </div>
          <ItemSelector onAddItem={onAddItem} />
        </div>
      )}
    </div>
  );
}
