import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, price, category, image, status, features, subdescription, price_subdescription } = body;

    const res = await pool.query(
      `UPDATE bespoke_collections
       SET title = $1, description = $2, price = $3, category = $4, image = $5, status = $6, features = $7, subdescription = $8, price_subdescription = $9
       WHERE id = $10
       RETURNING *`,
      [title, description, price, category, image, status, features, subdescription, price_subdescription, id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ bespoke: res.rows[0] });
  } catch (err) {
    console.error("[bespoke] PUT failed:", err);
    return NextResponse.json({ error: "Failed to update bespoke item" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const res = await pool.query("DELETE FROM bespoke_collections WHERE id = $1", [id]);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[bespoke] DELETE failed:", err);
    return NextResponse.json({ error: "Failed to delete bespoke item" }, { status: 500 });
  }
}
