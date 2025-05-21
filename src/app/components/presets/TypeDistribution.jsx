// components/TypeDistribution.jsx

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
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-700">
          Distribution des types d'objets
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
            onClick={randomizeTypeChances}
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
            Aléatoire
          </button>
          <button
            type="button"
            onClick={normalizePercentages}
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
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
            Normaliser
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <p className="text-sm text-gray-500 mb-3">
          Définissez la répartition des types d'objets en pourcentage. Le total
          doit être égal à 100%.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {availableTypes.map((type) => (
            <div key={type} className="flex items-center">
              <label
                htmlFor={`type-${type}`}
                className="block text-sm font-medium text-gray-700 mr-2 flex-grow"
              >
                {type}
              </label>
              <div className="relative w-20">
                <input
                  type="number"
                  id={`type-${type}`}
                  value={formData.typeChances[type] || ""}
                  onChange={(e) => handleTypeChanceChange(type, e.target.value)}
                  onFocus={(e) => {
                    // Quand le champ obtient le focus, si la valeur est 0, la remplacer par ""
                    if (formData.typeChances[type] === 0) {
                      handleTypeChanceChange(type, "");
                    }
                  }}
                  onBlur={(e) => {
                    // Quand le champ perd le focus, si la valeur est vide, la remettre à 0
                    if (e.target.value === "") {
                      handleTypeChanceChange(type, 0);
                    }
                  }}
                  min="0"
                  max="100"
                  className="block w-full pl-2 pr-8 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-end">
          <p
            className={`text-sm font-medium ${
              totalPercentage === 100 ? "text-green-600" : "text-red-600"
            }`}
          >
            Total: {totalPercentage}%
          </p>
        </div>
      </div>
    </div>
  );
}
