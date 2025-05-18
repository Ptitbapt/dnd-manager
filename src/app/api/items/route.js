// src/app/api/items/route.js
import { NextResponse } from "next/server";
import {
  getAllItems,
  createItem,
  getUniqueTypes,
  getUniqueRarities,
} from "../../lib/db";

export async function GET(request) {
  try {
    // Get search and filter parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "types") {
      const types = await getUniqueTypes();
      return NextResponse.json(types);
    } else if (action === "rarities") {
      const rarities = await getUniqueRarities();
      return NextResponse.json(rarities);
    } else {
      // Get all items
      const items = await getAllItems();
      return NextResponse.json(items);
    }
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Error fetching items" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Validate data
    if (!data.name || !data.type || !data.rarity || !data.source) {
      return NextResponse.json(
        { error: "Missing data: name, type, rarity, and source are required" },
        { status: 400 }
      );
    }

    const newItem = await createItem(data);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json({ error: "Error creating item" }, { status: 500 });
  }
}
