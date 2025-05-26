// app/presets/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PresetForm from "../../components/presets/PresetForm";

export default function EditPresetPage() {
  const params = useParams();
  const [preset, setPreset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPreset() {
      try {
        const response = await fetch(`/api/presets/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Preset non trouvé");
          } else {
            throw new Error(
              `Erreur ${response.status}: ${response.statusText}`
            );
          }
          return;
        }

        const data = await response.json();
        setPreset(data.preset);
      } catch (err) {
        console.error("Erreur lors du chargement du preset:", err);
        setError("Impossible de charger le preset. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      loadPreset();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-8 text-center">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-indigo-500"
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
            <p className="mt-2 text-gray-500">Chargement du preset...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Erreur</h3>
            <p className="mt-1 text-gray-500">{error}</p>
            <div className="mt-4">
              <a
                href="/presets"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retour à la liste des présets
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <PresetForm preset={preset} isEditMode={true} />
    </div>
  );
}
