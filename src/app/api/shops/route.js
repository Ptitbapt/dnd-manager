// app/api/shops/route.js
import { NextResponse } from "next/server";
import { saveShop, getAllShops } from "../../lib/shopGenerator";

export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: "Le nom de la boutique est requis" },
        { status: 400 }
      );
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: "La boutique doit contenir au moins un objet" },
        { status: 400 }
      );
    }

    const newShop = await saveShop(
      data.name,
      data.description || "",
      data.items
    );

    return NextResponse.json({
      success: true,
      id: newShop.id,
      message: "Boutique sauvegardée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la boutique:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde de la boutique" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const shops = await getAllShops();
    return NextResponse.json(shops);
  } catch (error) {
    console.error("Erreur lors de la récupération des boutiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des boutiques" },
      { status: 500 }
    );
  }
}
