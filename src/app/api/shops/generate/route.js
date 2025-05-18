// app/api/shops/generate/route.js
import { NextResponse } from "next/server";
import { generateShop, saveShop } from "../../../lib/shopGenerator";

export async function POST(request) {
  try {
    const data = await request.json();

    // Validate configuration
    if (!data.itemsPerRarity || !data.typeChances) {
      return NextResponse.json(
        {
          error:
            "Incomplete configuration: itemsPerRarity and typeChances are required",
        },
        { status: 400 }
      );
    }

    // Generate the shop
    const shopItems = await generateShop({
      itemsPerRarity: data.itemsPerRarity,
      typeChances: data.typeChances,
    });

    // Save the shop if requested
    if (data.save && data.name) {
      await saveShop(data.name, data.description || "", shopItems);
    }

    return NextResponse.json({ success: true, items: shopItems });
  } catch (error) {
    console.error("Error generating shop:", error);
    return NextResponse.json(
      { error: "Error generating shop" },
      { status: 500 }
    );
  }
}
