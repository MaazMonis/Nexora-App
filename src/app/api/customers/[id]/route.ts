import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch customer details
    const customerRes = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
    if (customerRes.rowCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Fetch interaction history (messages)
    const messagesRes = await pool.query(
      "SELECT * FROM messages WHERE customer_id = $1 ORDER BY created_at DESC",
      [id]
    );

    // Fetch request history
    const requestsRes = await pool.query(
      "SELECT * FROM custom_design_requests WHERE customer_id = $1 ORDER BY created_at DESC",
      [id]
    );

    return NextResponse.json({
      customer: customerRes.rows[0],
      messages: messagesRes.rows,
      requests: requestsRes.rows
    });
  } catch (err) {
    console.error("[customer-detail] GET failed:", err);
    return NextResponse.json({ error: "Failed to fetch customer details" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const res = await pool.query(
      `
      UPDATE customers 
      SET full_name = $1, email = $2, phone = $3, country = $4, 
          budget_preference = $5, jewelry_preferences = $6, internal_notes = $7, 
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
      `,
      [
        body.full_name,
        body.email.toLowerCase().trim(),
        body.phone || null,
        body.country || null,
        body.budget_preference || null,
        body.jewelry_preferences || null,
        body.internal_notes || null,
        id
      ]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer: res.rows[0] });
  } catch (err) {
    console.error("[customer-detail] PUT failed:", err);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await pool.query("DELETE FROM customers WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[customer-detail] DELETE failed:", err);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
