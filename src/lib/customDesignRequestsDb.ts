import { pool } from "@/lib/db";

export const CUSTOM_DESIGN_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
] as const;

export type CustomDesignStatus = (typeof CUSTOM_DESIGN_STATUSES)[number];

export async function ensureCustomDesignSchema() {
  // Customer inquiry storage for "Request 3D Design".
  await pool.query(`
    CREATE TABLE IF NOT EXISTS custom_design_requests (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      whatsapp_number VARCHAR(50) NOT NULL,
      email_address VARCHAR(255) NOT NULL,
      jewelry_type VARCHAR(200) NOT NULL,
      budget_range VARCHAR(200) NOT NULL,
      material_preference VARCHAR(200) NOT NULL,
      diamond_type VARCHAR(200) NOT NULL,
      ring_size VARCHAR(50),
      reference_image_url TEXT,
      additional_notes TEXT,
      product_title VARCHAR(255),
      product_kind VARCHAR(50),
      status VARCHAR(30) NOT NULL DEFAULT 'Pending',
      
      -- New Luxury Fields
      contact_method VARCHAR(50),
      jewelry_style VARCHAR(100),
      occasion_type VARCHAR(100),
      diamond_size VARCHAR(100),
      diamond_quality VARCHAR(100),
      diamond_color VARCHAR(100),
      stone_type VARCHAR(100),
      metal_finish VARCHAR(100),
      metal_color VARCHAR(100),
      delivery_timeline VARCHAR(100),
      custom_engraving BOOLEAN DEFAULT false,
      engraving_text TEXT,
      reference_image_urls TEXT[] DEFAULT '{}',
      preview_requested BOOLEAN DEFAULT false,
      country VARCHAR(100),

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Ensure columns exist if table was already created
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='custom_design_requests' AND column_name='contact_method') THEN
        ALTER TABLE custom_design_requests 
        ADD COLUMN contact_method VARCHAR(50),
        ADD COLUMN jewelry_style VARCHAR(100),
        ADD COLUMN occasion_type VARCHAR(100),
        ADD COLUMN diamond_size VARCHAR(100),
        ADD COLUMN diamond_quality VARCHAR(100),
        ADD COLUMN diamond_color VARCHAR(100),
        ADD COLUMN stone_type VARCHAR(100),
        ADD COLUMN metal_finish VARCHAR(100),
        ADD COLUMN metal_color VARCHAR(100),
        ADD COLUMN delivery_timeline VARCHAR(100),
        ADD COLUMN custom_engraving BOOLEAN DEFAULT false,
        ADD COLUMN engraving_text TEXT,
        ADD COLUMN reference_image_urls TEXT[] DEFAULT '{}',
        ADD COLUMN preview_requested BOOLEAN DEFAULT false,
        ADD COLUMN country VARCHAR(100);
      END IF;
    END $$;

  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS custom_design_request_events (
      id SERIAL PRIMARY KEY,
      request_id INT NOT NULL REFERENCES custom_design_requests(id) ON DELETE CASCADE,
      status VARCHAR(30) NOT NULL,
      changed_by VARCHAR(50) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

