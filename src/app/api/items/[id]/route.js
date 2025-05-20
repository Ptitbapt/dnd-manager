// src/app/api/items/[id]/route.js
import { getItemById } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  try {
    // Récupérer les paramètres de manière asynchrone
    const params = context.params;
    const id = params.id;

    // Vérifier si l'id est "types" ou "rarities" pour les cas spéciaux
    if (id === "types" || id === "rarities") {
      return NextResponse.redirect(
        new URL(`/api/items?action=${id}`, request.url)
      );
    }

    const item = await getItemById(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error(`Error retrieving item:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Également ajouter les méthodes PUT et DELETE si nécessaire
export async function PUT(request, context) {
  try {
    const params = context.params;
    const id = params.id;
    const data = await request.json();

    // Mettre à jour l'élément
    // ...

    return NextResponse.json({ message: "Item updated successfully" });
  } catch (error) {
    console.error(`Error updating item:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = context.params;
    const id = params.id;

    // Supprimer l'élément
    // ...

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(`Error deleting item:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
