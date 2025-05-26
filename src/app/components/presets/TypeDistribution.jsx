// components/presets/TypeDistribution.jsx

export default function TypeDistribution({
  availableTypes,
  formData,
  handleTypeChanceChange,
  clearAllValues,
  randomizeTypeChances,
  normalizePercentages,
  totalPercentage,
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Distribution des types d'objets
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
            onClick={randomizeTypeChances}
            className="px-3 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Aléatoire
          </button>
          <button
            type="button"
            onClick={normalizePercentages}
            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Normaliser
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTypes.map((type) => (
            <div key={type}>
              <label
                htmlFor={`type-${type}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {type}
              </label>
              <div className="relative">
                <input
                  type="number"
                  id={`type-${type}`}
                  min="0"
                  max="100"
                  value={formData.typeChances[type] || ""}
                  onChange={(e) => handleTypeChanceChange(type, e.target.value)}
                  className="block w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total des pourcentages :
          </span>
          <span
            className={`font-bold text-lg ${
              totalPercentage === 100
                ? "text-green-600"
                : totalPercentage > 100
                ? "text-red-600"
                : "text-orange-600"
            }`}
          >
            {totalPercentage}%
          </span>
        </div>

        {totalPercentage !== 100 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ Les pourcentages doivent totaliser exactement 100%. Utilisez le
              bouton "Normaliser" pour ajuster automatiquement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
