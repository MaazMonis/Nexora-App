import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
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
    const { is_read } = await request.json();

    const res = await pool.query(
      "UPDATE messages SET is_read = $1 WHERE id = $2 RETURNING *",
      [is_read, id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message: res.rows[0] });
  } catch (err) {
    console.error("[messages-update] PUT failed:", err);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}
