// components/shops/TypeChanceSelector.jsx
"use client";
import { useState, useEffect } from "react";

export default function TypeChanceSelector({
  types,
  shopConfig,
  onTypeChanceChange,
  onNormalize,
  onRandomize,
  totalPercentage,
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <h3 className="text-md font-semibold mb-4 flex items-center justify-between border-b pb-2 border-amber-200">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
          Chances de type
          <span className="ml-2 text-xs text-gray-500 font-normal">
            (pourcentages)
          </span>
        </div>
        <div className="flex items-center">
          <div
            className={`text-sm font-bold mr-2 ${
              totalPercentage === 100 ? "text-green-500" : "text-red-500"
            }`}
          >
            Total: {totalPercentage}%
          </div>
          <button
            type="button"
            className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs hover:bg-amber-200 transition-colors mr-2 flex items-center"
            onClick={onRandomize}
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
            Randomiser
          </button>
        </div>
      </h3>

      <div className="space-y-3">
        {types.map((type) => (
          <div key={type} className="flex items-center">
            <div className="w-16 text-center font-medium">
              {shopConfig.typeChances[type] || 0}%
            </div>
            <div className="flex-grow mx-3">
              <input
                type="range"
                id={`type-range-${type}`}
                value={shopConfig.typeChances[type] || 0}
                onChange={(e) => onTypeChanceChange(type, e.target.value)}
                min="0"
                max="100"
                step="1"
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
              />
            </div>
            <label
              htmlFor={`type-${type}`}
              className="text-sm font-medium text-gray-700 w-24"
            >
              {type}
            </label>
            <input
              type="number"
              id={`type-${type}`}
              value={shopConfig.typeChances[type] || 0}
              onChange={(e) => onTypeChanceChange(type, e.target.value)}
              min="0"
              max="100"
              className="form-input w-16 text-center bg-amber-50 border-amber-200 focus:border-amber-400 focus:ring focus:ring-amber-200 focus:ring-opacity-50 transition-all"
              title="Vous pouvez entrer n'importe quelle valeur entre 0 et 100"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 italic">
        <p>
          Les pourcentages déterminent la probabilité que chaque type d'objet
          apparaisse dans votre boutique. Le total doit être de 100%.{" "}
          <strong>Astuce :</strong> Saisissez directement vos valeurs dans les
          champs à droite pour plus de précision.
        </p>
      </div>

      <div className="mt-4 text-right">
        <button
          type="button"
          className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md text-sm hover:bg-amber-200 transition-colors"
          onClick={onNormalize}
        >
          Normaliser à 100%
        </button>
      </div>
    </div>
  );
}
