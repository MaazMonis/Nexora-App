import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import twilio from "twilio";

import { pool } from "@/lib/db";
import { ensureCustomDesignSchema } from "@/lib/customDesignRequestsDb";
import { ensureCrmSchema, syncCustomer } from "@/lib/crmDb";
import { verifyToken } from "@/lib/auth";

const ALLOWED_STATUSES = ["Pending", "In Progress", "Completed"] as const;

type CreatePayload = {
  full_name: string;
  whatsapp_number: string;
  email_address: string;
  jewelry_type: string;
  budget_range: string;
  material_preference: string;
  diamond_type: string;
  ring_size?: string | null;
  reference_image_url?: string | null;
  additional_notes?: string | null;
  product_title?: string | null;
  product_kind?: string | null;

  // New Fields
  contact_method?: string;
  jewelry_style?: string;
  occasion_type?: string;
  diamond_size?: string;
  diamond_quality?: string;
  diamond_color?: string;
  stone_type?: string;
  metal_finish?: string;
  metal_color?: string;
  delivery_timeline?: string;
  custom_engraving?: boolean;
  engraving_text?: string;
  reference_image_urls?: string[];
  preview_requested?: boolean;
  country?: string;
};

function normalizeWhatsAppNumberToDigits(input: string) {
  // Twilio accepts E.164 or whatsapp:+... strings; we avoid accidental spaces.
  return (input || "").trim().replace(/[^\d+]/g, "");
}

function withWhatsAppPrefix(num: string) {
  const trimmed = (num || "").trim();
  if (!trimmed) return trimmed;
  return trimmed.startsWith("whatsapp:") ? trimmed : `whatsapp:${trimmed}`;
}

async function sendAdminWhatsApp({
  payload,
  reference_image_url,
}: {
  payload: CreatePayload;
  reference_image_url?: string | null;
}) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    const to = process.env.ADMIN_WHATSAPP_TO;

    if (!accountSid || !authToken || !from || !to) {
      console.warn(
        "[custom-design] Twilio env vars missing; skipping WhatsApp notification."
      );
      return { twilioSent: false };
    }

    const client = twilio(accountSid, authToken);

    const phoneTo = withWhatsAppPrefix(normalizeWhatsAppNumberToDigits(to));
    const phoneFrom = withWhatsAppPrefix(from);

    const messageBody = [
      "New Custom Jewelry Design Request",
      `Customer: ${payload.full_name}`,
      `WhatsApp: ${payload.whatsapp_number}`,
      `Email: ${payload.email_address}`,
      `Product: ${payload.product_title || "-"}`,
      `Jewelry Type: ${payload.jewelry_type}`,
      `Budget: ${payload.budget_range}`,
      `Material: ${payload.material_preference}`,
      `Diamond Type: ${payload.diamond_type}`,
      `Ring Size: ${payload.ring_size || "-"}`,
      `Notes: ${payload.additional_notes || "-"}`,
      `Reference Image: ${reference_image_url || "-"}`,
    ].join("\n");

    await client.messages.create({
      from: phoneFrom,
      to: phoneTo,
      body: messageBody,
    });

    return { twilioSent: true };
  } catch (err) {
    console.error("[custom-design] Twilio WhatsApp failed:", err);
    return { twilioSent: false, error: "Twilio failed" };
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureCustomDesignSchema();
    await ensureCrmSchema();

    const requestsRes = await pool.query(
      "SELECT * FROM custom_design_requests ORDER BY created_at DESC"
    );
    const eventsRes = await pool.query(
      "SELECT * FROM custom_design_request_events ORDER BY created_at ASC"
    );

    return NextResponse.json({
      requests: requestsRes.rows,
      events: eventsRes.rows,
    });
  } catch (err) {
    console.error("[custom-design] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch custom design requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreatePayload;

    await ensureCustomDesignSchema();
    await ensureCrmSchema();

    // Sync customer to CRM
    const customerId = await syncCustomer({
      full_name: payload.full_name,
      email: payload.email_address,
      phone: payload.whatsapp_number,
      country: payload.country
    });

    const product_title = payload.product_title || null;
    const product_kind = payload.product_kind || null;

    const insertRes = await pool.query(
      `
        INSERT INTO custom_design_requests (
          full_name, whatsapp_number, email_address, jewelry_type, budget_range,
          material_preference, diamond_type, ring_size, reference_image_url, additional_notes,
          product_title, product_kind, status, customer_id,
          contact_method, jewelry_style, occasion_type, diamond_size, diamond_quality,
          diamond_color, stone_type, metal_finish, metal_color, delivery_timeline,
          custom_engraving, engraving_text, reference_image_urls, preview_requested, country
        )
        VALUES (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,
          $11,$12,'Pending',$13,
          $14,$15,$16,$17,$18,
          $19,$20,$21,$22,$23,
          $24,$25,$26,$27,$28
        )
        RETURNING *
      `,
      [
        payload.full_name, payload.whatsapp_number, payload.email_address, payload.jewelry_type, payload.budget_range,
        payload.material_preference, payload.diamond_type, payload.ring_size || null, payload.reference_image_url || null, payload.additional_notes || null,
        product_title, product_kind, customerId,
        payload.contact_method || null, payload.jewelry_style || null, payload.occasion_type || null, payload.diamond_size || null, payload.diamond_quality || null,
        payload.diamond_color || null, payload.stone_type || null, payload.metal_finish || null, payload.metal_color || null, payload.delivery_timeline || null,
        payload.custom_engraving || false, payload.engraving_text || null, payload.reference_image_urls || '{}', payload.preview_requested || false, payload.country || null
      ]
    );

    const created = insertRes.rows[0];

    // Create a message entry for the inbox
    await pool.query(`
      INSERT INTO messages (customer_id, sender_type, message_type, subject, content, metadata)
      VALUES ($1, 'customer', 'custom_design', $2, $3, $4)
    `, [
      customerId,
      `New 3D Design Request: ${payload.jewelry_type}`,
      payload.additional_notes || "Request submitted via website.",
      JSON.stringify({ 
        request_id: created.id,
        budget: payload.budget_range,
        material: payload.material_preference,
        image: payload.reference_image_url
      })
    ]);

    await pool.query(
      `
        INSERT INTO custom_design_request_events (request_id, status, changed_by)
        VALUES ($1,'Pending','customer')
      `,
      [created.id]
    );

    // Send admin WhatsApp notification (best-effort).
    const twilioResult = await sendAdminWhatsApp({
      payload,
      reference_image_url: payload.reference_image_url,
    });

    return NextResponse.json({
      request: created,
      notification: twilioResult,
    });
  } catch (err) {
    console.error("[custom-design] POST failed:", err);
    return NextResponse.json(
      { error: "Failed to create custom design request" },
      { status: 500 }
    );
  }
}

