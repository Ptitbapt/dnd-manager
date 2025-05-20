"use client";
// app/items/add/page.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ItemForm from "../../components/items/ItemForm";

export default function AddItem() {
  const router = useRouter();
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Chargement des types et raretés
  useEffect(() => {
    async function fetchOptions() {
      try {
        setIsLoading(true);
        const [typesResponse, raritiesResponse] = await Promise.all([
          fetch("/api/items?action=types"),
          fetch("/api/items?action=rarities"),
        ]);

        if (typesResponse.ok && raritiesResponse.ok) {
          const [typesData, raritiesData] = await Promise.all([
            typesResponse.json(),
            raritiesResponse.json(),
          ]);

          setTypes(typesData);
          setRarities(raritiesData);
        } else {
          setErrorMessage("Échec du chargement des options");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des options:", error);
        setErrorMessage("Erreur lors du chargement des options");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOptions();
  }, []);

  const handleSubmit = async (itemData) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        // Redirection vers la liste des objets après l'ajout
        router.push("/items");
      } else {
        const status = response.status;
        let errorText = "Erreur lors de l'ajout de l'objet";

        try {
          const text = await response.text();
          if (text) {
            try {
              const data = JSON.parse(text);
              if (data && data.error) {
                errorText = data.error;
              }
            } catch (parseError) {
              if (text.length < 100) {
                errorText = text;
              }
            }
          }
        } catch (readError) {
          console.error("Impossible de lire la réponse:", readError);
        }

        setErrorMessage(`${errorText} (Code: ${status})`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'objet:", error);
      setErrorMessage(
        "Une erreur s'est produite lors de la communication avec le serveur"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 text-center">
          <LoadingSpinner message="Chargement des options..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <h1 className="text-xl font-medium text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-indigo-600"
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
          Ajouter un Objet
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Ajouter un nouvel objet à la base de données
        </p>
      </div>

      <ItemForm
        types={types}
        rarities={rarities}
        onSubmit={handleSubmit}
        submitLabel="Enregistrer"
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
      />
    </div>
  );
}
