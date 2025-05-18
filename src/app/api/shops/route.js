// app/api/shops/route.js
import { NextResponse } from "next/server";
import {
  getAllShops,
  getShopWithItems,
  saveShop,
  deleteShop,
} from "../../lib/shopGenerator";

export async function GET(request) {
  try {
    // Get parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Get a specific shop with its items
      const shop = await getShopWithItems(id);

      if (!shop) {
        return NextResponse.json({ error: "Shop not found" }, { status: 404 });
      }

      return NextResponse.json(shop);
    } else {
      // Get all shops
      const shops = await getAllShops();
      return NextResponse.json(shops);
    }
  } catch (error) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      { error: "Error fetching shops" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Validate data
    if (!data.name || !data.items || !Array.isArray(data.items)) {
      return NextResponse.json(
        { error: "Missing data: name and items (array) are required" },
        { status: 400 }
      );
    }

    const shop = await saveShop(data.name, data.description || "", data.items);
    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    console.error("Error saving shop:", error);
    return NextResponse.json({ error: "Error saving shop" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing shop ID" }, { status: 400 });
    }

    await deleteShop(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shop:", error);
    return NextResponse.json({ error: "Error deleting shop" }, { status: 500 });
  }
}
