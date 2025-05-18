// src/app/api/items/[id]/route.js
import { NextResponse } from "next/server";
import { getItemById, updateItem, deleteItem } from "../../../lib/db";

export async function GET(request, { params }) {
  try {
    const item = await getItemById(params.id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json({ error: "Error fetching item" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();

    // Validate data
    if (!data.name || !data.type || !data.rarity || !data.source) {
      return NextResponse.json(
        { error: "Missing data: name, type, rarity, and source are required" },
        { status: 400 }
      );
    }

    const updatedItem = await updateItem(params.id, data);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "Error updating item" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteItem(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Error deleting item" }, { status: 500 });
  }
}
