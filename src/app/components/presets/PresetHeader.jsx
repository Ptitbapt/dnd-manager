// components/PresetHeader.jsx

export default function PresetHeader({ isEditMode }) {
  return (
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
      <h1 className="text-xl font-medium text-gray-800">
        {isEditMode ? "Modifier le preset" : "Créer un nouveau preset"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {isEditMode
          ? "Modifiez les paramètres du preset existant"
          : "Configurez un nouveau preset pour générer des boutiques rapidement"}
      </p>
    </div>
  );
}
