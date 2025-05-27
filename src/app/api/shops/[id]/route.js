// app/api/shops/[id]/route.js
import { NextResponse } from "next/server";
import { getShopWithItems, deleteShop } from "../../../lib/shopGenerator";

export async function GET(request, context) {
  try {
    // CORRECTION: Await params avant de les utiliser (Next.js 15+)
    const params = await context.params;
    const shopId = params.id;

    console.log(`GET pour boutique ID: ${shopId}`);

    if (!shopId) {
      return NextResponse.json(
        { error: "ID de boutique non spécifié" },
        { status: 400 }
      );
    }

    const shop = await getShopWithItems(shopId);

    if (!shop) {
      return NextResponse.json(
        { error: "Boutique non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Erreur lors de la récupération de la boutique:", error);
    return NextResponse.json(
      {
        error:
          "Erreur lors de la récupération de la boutique: " + error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    // CORRECTION: Await params avant de les utiliser (Next.js 15+)
    const params = await context.params;
    const shopId = params.id;

    console.log(`DELETE pour boutique ID: ${shopId}`);

    if (!shopId) {
      return NextResponse.json(
        { error: "ID de boutique non spécifié" },
        { status: 400 }
      );
    }

    await deleteShop(shopId);

    return NextResponse.json({
      success: true,
      message: "Boutique supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la boutique:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la suppression de la boutique: " + error.message,
      },
      { status: 500 }
    );
  }
}
