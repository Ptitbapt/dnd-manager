"use client";

import { useState } from "react";
import ItemLink from "../ui/ItemLink";
import TypeBadge from "../ui/TypeBadge";
import RarityBadge from "../ui/RarityBadge";

export default function ShopItemsTable({ shopItems, onRemoveItem }) {
  if (!shopItems || shopItems.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500">
          Aucun objet n'a été ajouté à cette boutique pour le moment.
        </p>
      </div>
    );
  }

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
              Source
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {shopItems.map((item, index) => (
            <tr
              key={`${item.IDX}-${index}`}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="whitespace-nowrap py-3 px-4 text-sm font-medium text-gray-900">
                <ItemLink name={item.Nomobjet} />
              </td>
              <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                <TypeBadge type={item.Type} subtype={item.Soustype} />
              </td>
              <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                <RarityBadge rarity={item.Rarete} />
              </td>
              <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                {item.Valeur ? `${item.Valeur} PO` : "-"}
              </td>
              <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {item.Source}
                </span>
              </td>
              <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-700">
                <button
                  onClick={() => onRemoveItem(item.IDX)}
                  className="text-red-600 hover:text-red-900 focus:outline-none"
                  title="Retirer de la boutique"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
