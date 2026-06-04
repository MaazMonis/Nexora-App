import { pool } from "@/lib/db";

export async function ensureCrmSchema() {
  // 1. Customers Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      country VARCHAR(100),
      budget_preference VARCHAR(200),
      jewelry_preferences TEXT,
      internal_notes TEXT,
      last_activity_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // 2. Messages Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
      sender_type VARCHAR(20) NOT NULL, -- 'customer' or 'admin'
      message_type VARCHAR(50) NOT NULL, -- 'website_inquiry', 'custom_design', 'support', 'reply'
      subject VARCHAR(255),
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      metadata JSONB DEFAULT '{}', -- images, product links etc.
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // 3. Add customer_id to custom_design_requests if it doesn't exist
  try {
    await pool.query(`
      ALTER TABLE custom_design_requests 
      ADD COLUMN IF NOT EXISTS customer_id INT REFERENCES customers(id) ON DELETE SET NULL;
    `);
  } catch (err) {
    console.error("Error altering custom_design_requests:", err);
  }
}

/**
 * Ensures a customer exists in the CRM and returns their ID.
 * Links by email.
 */
export async function syncCustomer({
  full_name,
  email,
  phone
}: {
  full_name: string;
  email: string;
  phone?: string;
}) {
  try {
    const res = await pool.query(
      `
      INSERT INTO customers (full_name, email, phone, last_activity_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, customers.phone),
        last_activity_at = NOW(),
        updated_at = NOW()
      RETURNING id
      `,
      [full_name, email.toLowerCase().trim(), phone || null]
    );
    return res.rows[0].id;
  } catch (err) {
    console.error("syncCustomer failed:", err);
    return null;
  }
}
