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

    const res = await pool.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM custom_design_requests WHERE customer_id = c.id) as request_count
      FROM customers c 
      ORDER BY last_activity_at DESC
    `);

    return NextResponse.json({ customers: res.rows });
  } catch (err) {
    console.error("[customers] GET failed:", err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { full_name, email, phone, country, internal_notes } = await request.json();

    await ensureCrmSchema();

    const res = await pool.query(
      `
      INSERT INTO customers (full_name, email, phone, country, internal_notes)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, customers.phone),
        country = COALESCE(EXCLUDED.country, customers.country),
        internal_notes = COALESCE(EXCLUDED.internal_notes, customers.internal_notes),
        updated_at = NOW()
      RETURNING *
      `,
      [full_name, email.toLowerCase().trim(), phone || null, country || null, internal_notes || null]
    );

    return NextResponse.json({ customer: res.rows[0] });
  } catch (err) {
    console.error("[customers] POST failed:", err);
    return NextResponse.json({ error: "Failed to create/update customer" }, { status: 500 });
  }
}
