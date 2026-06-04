import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ensureCrmSchema } from "@/lib/crmDb";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureCrmSchema();

    // Fetch messages with customer names
    const res = await pool.query(`
      SELECT m.*, c.full_name as customer_name, c.email as customer_email
      FROM messages m
      LEFT JOIN customers c ON m.customer_id = c.id
      ORDER BY m.created_at DESC
    `);

    return NextResponse.json({ messages: res.rows });
  } catch (err) {
    console.error("[messages] GET failed:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customer_id, message_type, subject, content, metadata } = await request.json();

    await ensureCrmSchema();

    const res = await pool.query(
      `
      INSERT INTO messages (customer_id, sender_type, message_type, subject, content, metadata)
      VALUES ($1, 'admin', $2, $3, $4, $5)
      RETURNING *
      `,
      [customer_id, message_type || 'reply', subject || 'Response from Nexora', content, JSON.stringify(metadata || {})]
    );

    // Update customer last activity
    await pool.query("UPDATE customers SET last_activity_at = NOW() WHERE id = $1", [customer_id]);

    return NextResponse.json({ message: res.rows[0] });
  } catch (err) {
    console.error("[messages] POST failed:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
