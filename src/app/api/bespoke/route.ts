import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const res = await pool.query("SELECT * FROM bespoke_collections ORDER BY id DESC");
    return NextResponse.json({ bespoke: res.rows });
  } catch (err) {
    console.error("[bespoke] GET failed:", err);
    return NextResponse.json({ error: "Failed to fetch bespoke collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, price, category, image, status } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const res = await pool.query(
      `INSERT INTO bespoke_collections (title, description, price, category, image, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, price || 0, category, image, status || 'Active']
    );

    return NextResponse.json({ bespoke: res.rows[0] });
  } catch (err) {
    console.error("[bespoke] POST failed:", err);
    return NextResponse.json({ error: "Failed to create bespoke item" }, { status: 500 });
  }
}
