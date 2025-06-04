// app/api/items/[id]/route.js - Version corrigée
import { getItemById, updateItem, deleteItem } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  try {
    // CORRECTION : Récupérer les paramètres de manière asynchrone (Next.js 15+)
    const params = await context.params;
    const id = params.id;

    console.log(`GET /api/items/${id} - Récupération de l'objet`);

    // Vérifier si l'id est "types" ou "rarities" pour les cas spéciaux
    if (id === "types" || id === "rarities") {
      console.log(`Redirection vers /api/items/${id}`);
      return NextResponse.redirect(new URL(`/api/items/${id}`, request.url));
    }

    const item = await getItemById(id);

    if (!item) {
      console.log(`Objet avec ID ${id} non trouvé`);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    console.log(`Objet avec ID ${id} récupéré avec succès`);
    return NextResponse.json(item);
  } catch (error) {
    console.error(`Error retrieving item:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    // CORRECTION : Récupérer les paramètres de manière asynchrone (Next.js 15+)
    const params = await context.params;
    const id = params.id;
    const data = await request.json();

    console.log(`PUT /api/items/${id} - Mise à jour de l'objet`);
    console.log("Données reçues pour la mise à jour:", data);

    // Vérifier si l'objet existe
    const existingItem = await getItemById(id);
    if (!existingItem) {
      console.log(`Objet avec ID ${id} non trouvé pour la mise à jour`);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Mettre à jour l'objet
    const updatedItem = await updateItem(id, data);

    console.log(`Objet avec ID ${id} mis à jour avec succès`);
    return NextResponse.json({
      success: true,
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error(`Error updating item:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    // CORRECTION : Récupérer les paramètres de manière asynchrone (Next.js 15+)
    const params = await context.params;
    const id = params.id;

    console.log(`DELETE /api/items/${id} - Suppression de l'objet`);

    // Vérifier si l'objet existe
    try {
      const existingItem = await getItemById(id);

      if (!existingItem) {
        console.log(`Objet avec ID ${id} non trouvé pour la suppression`);
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
    } catch (lookupError) {
      console.error(
        `Erreur lors de la vérification de l'existence de l'objet ${id}:`,
        lookupError
      );
      // Continuer même si on ne peut pas vérifier l'existence,
      // car l'objet pourrait exister même si la vérification échoue
    }

    // Supprimer l'objet
    try {
      await deleteItem(id);
      console.log(`Objet avec ID ${id} supprimé avec succès`);
      return NextResponse.json({
        success: true,
        message: "Item deleted successfully",
      });
    } catch (deleteError) {
      console.error(
        `Erreur lors de la suppression de l'objet ${id}:`,
        deleteError
      );
      return NextResponse.json(
        { error: `Erreur lors de la suppression: ${deleteError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`Error deleting item:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
