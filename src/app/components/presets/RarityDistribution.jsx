// components/presets/RarityDistribution.jsx

export default function RarityDistribution({
  availableRarities,
  formData,
  handleRarityConfigChange,
  clearAllValues,
  randomizeRarityConfig,
}) {
  // Calculer le total des objets
  const totalItems = Object.values(formData.rarityConfig).reduce(
    (sum, value) => sum + (parseInt(value) || 0),
    0
  );

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Nombre d'objets par rareté
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={clearAllValues}
            className="px-3 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Effacer tout
          </button>
          <button
            type="button"
            onClick={randomizeRarityConfig}
            className="px-3 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Aléatoire
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableRarities.map((rarity) => (
            <div key={rarity}>
              <label
                htmlFor={`rarity-${rarity}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {rarity}
              </label>
              <input
                type="number"
                id={`rarity-${rarity}`}
                min="0"
                max="50"
                value={formData.rarityConfig[rarity] || ""}
                onChange={(e) =>
                  handleRarityConfigChange(rarity, e.target.value)
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total d'objets dans la boutique :
          </span>
          <span className="font-bold text-lg text-indigo-600">
            {totalItems} objet{totalItems !== 1 ? "s" : ""}
          </span>
        </div>

        {totalItems === 0 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ Aucun objet configuré. La boutique sera vide.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
