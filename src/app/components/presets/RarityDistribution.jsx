// components/RarityDistribution.jsx

export default function RarityDistribution({
  availableRarities,
  formData,
  handleRarityConfigChange,
  clearAllValues,
  randomizeRarityConfig,
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-700">
          Nombre d'objets par rareté
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={clearAllValues}
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Tout effacer
          </button>
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
      </div>

      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="text-sm text-gray-500 mb-3">
          Définissez le nombre d'objets par niveau de rareté à inclure dans la
          boutique.
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
                    // Cette opération est gérée par le parent car elle modifie formData
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
  );
}
