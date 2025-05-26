"use client";

import { useState } from "react";
import ItemLink from "../ui/ItemLink";
import TypeBadge from "../ui/TypeBadge";
import RarityBadge from "../ui/RarityBadge";

export default function ShopItemsTable({
  shopItems,
  onRemoveItem,
  onUpdateItem,
}) {
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({});

  if (!shopItems || shopItems.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500">
          Aucun objet n'a été ajouté à cette boutique pour le moment.
        </p>
      </div>
    );
  }

  // Démarrer l'édition d'un item
  const startEditing = (item) => {
    setEditingItem(item.IDX || item.Index);
    setEditValues({
      value: parseFloat(item.Valeur) || 0,
      weight: parseFloat(item.Poids) || 0,
      characteristics: item.Caracteristiques || "",
      additionalInfo: item.InfoSupplementaire || item.Infosupplementaire || "",
    });
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingItem(null);
    setEditValues({});
  };

  // Sauvegarder les modifications
  const saveEditing = () => {
    if (editingItem && onUpdateItem) {
      const updatedItem = {
        ...shopItems.find((item) => (item.IDX || item.Index) === editingItem),
        Valeur: editValues.value.toString(),
        Poids: editValues.weight.toString(),
        Caracteristiques: editValues.characteristics,
        InfoSupplementaire: editValues.additionalInfo,
        Infosupplementaire: editValues.additionalInfo, // Support pour les deux noms de champs
      };

      onUpdateItem(editingItem, updatedItem);
    }
    setEditingItem(null);
    setEditValues({});
  };

  // Gérer les changements dans les champs d'édition
  const handleEditChange = (field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Gérer la touche Entrée pour sauvegarder
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEditing();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
              Nom
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
              Type
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
              Rareté
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
              Valeur (PO)
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
              Poids
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
              Caractéristiques
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
              Source
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {shopItems.map((item, index) => {
            const itemId = item.IDX || item.Index;
            const isEditing = editingItem === itemId;

            return (
              <tr
                key={`${itemId}-${index}`}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="whitespace-nowrap py-3 px-4 text-sm font-medium text-gray-900">
                  <ItemLink name={item.Nomobjet || item.NomObjet} />
                </td>
                <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                  <TypeBadge
                    type={item.Type}
                    subtype={item.Soustype || item.SousType}
                  />
                </td>
                <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                  <RarityBadge rarity={item.Rarete} />
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editValues.value}
                      onChange={(e) =>
                        handleEditChange(
                          "value",
                          e.target.value === ""
                            ? ""
                            : parseFloat(e.target.value) || 0
                        )
                      }
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          e.target.value = "";
                          handleEditChange("value", "");
                        }
                      }}
                      onKeyDown={handleKeyPress}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => startEditing(item)}
                    >
                      {item.Valeur ? `${item.Valeur} PO` : "-"}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={editValues.weight}
                      onChange={(e) =>
                        handleEditChange(
                          "weight",
                          e.target.value === ""
                            ? ""
                            : parseFloat(e.target.value) || 0
                        )
                      }
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          e.target.value = "";
                          handleEditChange("weight", "");
                        }
                      }}
                      onKeyDown={handleKeyPress}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => startEditing(item)}
                    >
                      {item.Poids ? `${item.Poids} kg` : "-"}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 max-w-xs">
                  {isEditing ? (
                    <textarea
                      value={editValues.characteristics}
                      onChange={(e) =>
                        handleEditChange("characteristics", e.target.value)
                      }
                      onKeyDown={handleKeyPress}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      rows="2"
                      placeholder="Caractéristiques..."
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded block truncate"
                      onClick={() => startEditing(item)}
                      title={item.Caracteristiques}
                    >
                      {item.Caracteristiques || "-"}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {item.Source}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEditing}
                          className="text-green-600 hover:text-green-900 focus:outline-none"
                          title="Sauvegarder les modifications"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
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
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 hover:text-gray-900 focus:outline-none"
                          title="Annuler les modifications"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
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
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(item)}
                          className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                          title="Modifier l'objet"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
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
                        </button>
                        <button
                          onClick={() => onRemoveItem(itemId)}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                          title="Retirer de la boutique"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {editingItem && (
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-2">
          <p className="text-sm text-blue-700">
            <strong>Mode édition :</strong> Cliquez sur ✓ pour sauvegarder ou ✗
            pour annuler. Vous pouvez aussi utiliser Entrée pour sauvegarder ou
            Échap pour annuler.
          </p>
        </div>
      )}
    </div>
  );
}
