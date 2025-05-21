"use client";
// app/items/[id]/page.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ItemForm from "../../components/items/ItemForm";

export default function EditItem({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [initialData, setInitialData] = useState(null);
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Chargement des données de l'objet et des options
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        // Effectuer les requêtes en parallèle
        const [itemResponse, typesResponse, raritiesResponse] =
          await Promise.all([
            fetch(`/api/items/${id}`),
            fetch("/api/items?action=types"),
            fetch("/api/items?action=rarities"),
          ]);

        if (!itemResponse.ok) {
          throw new Error(
            `Erreur lors du chargement de l'objet (${itemResponse.status})`
          );
        }

        // Traitement des données de l'objet
        let item;
        try {
          item = await itemResponse.json();
        } catch (error) {
          console.error(
            "Erreur lors du parsing des données de l'objet:",
            error
          );
          throw new Error("Impossible de lire les données de l'objet");
        }

        // Traitement des types avec gestion d'erreur
        let typesData = [];
        if (typesResponse.ok) {
          try {
            const typesResult = await typesResponse.json();
            console.log("Types response data:", typesResult);

            // Gérer différents formats de réponse possibles
            typesData = Array.isArray(typesResult.types)
              ? typesResult.types
              : Array.isArray(typesResult)
              ? typesResult
              : [];

            console.log("Types processed:", typesData);
          } catch (error) {
            console.error("Erreur lors du traitement des types:", error);
            // Utiliser des valeurs par défaut
            typesData = ["Arme", "Armure", "Équipement", "Objet merveilleux"];
          }
        } else {
          console.warn(
            "Impossible de récupérer les types:",
            typesResponse.status
          );
          // Utiliser des valeurs par défaut
          typesData = ["Arme", "Armure", "Équipement", "Objet merveilleux"];
        }

        // Traitement des raretés avec gestion d'erreur
        let raritiesData = [];
        if (raritiesResponse.ok) {
          try {
            const raritiesResult = await raritiesResponse.json();
            console.log("Rarities response data:", raritiesResult);

            // Gérer différents formats de réponse possibles
            raritiesData = Array.isArray(raritiesResult.rarities)
              ? raritiesResult.rarities
              : Array.isArray(raritiesResult)
              ? raritiesResult
              : [];

            console.log("Rarities processed:", raritiesData);
          } catch (error) {
            console.error("Erreur lors du traitement des raretés:", error);
            // Utiliser des valeurs par défaut
            raritiesData = [
              "Commun",
              "Peu commun",
              "Rare",
              "Très rare",
              "Légendaire",
            ];
          }
        } else {
          console.warn(
            "Impossible de récupérer les raretés:",
            raritiesResponse.status
          );
          // Utiliser des valeurs par défaut
          raritiesData = [
            "Commun",
            "Peu commun",
            "Rare",
            "Très rare",
            "Légendaire",
          ];
        }

        // Mise à jour des states
        setTypes(typesData);
        setRarities(raritiesData);

        // Association des champs de la base de données aux champs du formulaire
        setInitialData({
          name: item.Nomobjet || "",
          type: item.Type || "",
          subType: item.Soustype || "",
          proficiency: item.Maitrise || "",
          rarity: item.Rarete || "",
          characteristics: item.Caractéristiques || "",
          value:
            item.Valeur !== null ? String(item.Valeur).replace(".", ",") : "",
          additionalInfo: item.Infosupplémentaire || "",
          weight: item.Poids !== null ? String(item.Poids) : "",
          source: item.Source || "",
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setErrorMessage(error.message || "Échec du chargement de l'objet");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleSubmit = async (itemData) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      console.log("Données envoyées à l'API:", itemData);

      const response = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        // Redirection vers la liste des objets après la mise à jour
        router.push("/items");
      } else {
        // Obtenir le statut de la réponse HTTP
        const status = response.status;

        let errorText = "Erreur lors de la mise à jour de l'objet";
        try {
          // Tenter de lire le corps de la réponse
          const text = await response.text();
          console.log("Réponse d'erreur complète:", text);
          if (text) {
            try {
              const data = JSON.parse(text);
              if (data && data.error) {
                errorText = data.error;
              }
            } catch (parseError) {
              console.error(
                "Impossible de parser la réponse JSON:",
                parseError
              );
              if (text.length < 100) {
                errorText = text;
              }
            }
          }
        } catch (readError) {
          console.error("Impossible de lire la réponse:", readError);
        }

        console.error(`Erreur de mise à jour (${status}):`, errorText);
        setErrorMessage(`${errorText} (Code: ${status})`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'objet:", error);
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
          <LoadingSpinner
            message="Chargement des données de l'objet..."
            size="lg"
          />
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
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Modifier l'objet
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Mettre à jour les détails de l'objet
        </p>
      </div>

      <ItemForm
        initialData={initialData}
        types={types}
        rarities={rarities}
        onSubmit={handleSubmit}
        submitLabel="Mettre à jour"
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
      />
    </div>
  );
}
