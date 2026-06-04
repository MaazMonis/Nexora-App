import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { pool } from "@/lib/db";
import { ensureCustomDesignSchema } from "@/lib/customDesignRequestsDb";
import { verifyToken } from "@/lib/auth";

const ALLOWED_STATUSES = ["Pending", "In Review", "Designing", "Completed", "Cancelled"] as const;
const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

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

    await ensureCustomDesignSchema();

    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    const body = await request.json();
    const newStatus = body?.status as string;
    const adminNotes = body?.admin_notes as string | undefined;
    const priority = body?.priority as string | undefined;

    let updateQuery = "UPDATE custom_design_requests SET updated_at = NOW()";
    const updateParams: any[] = [];
    let paramIdx = 1;

    if (newStatus) {
      if (!ALLOWED_STATUSES.includes(newStatus as any)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateQuery += `, status = $${paramIdx++}`;
      updateParams.push(newStatus);
    }

    if (adminNotes !== undefined) {
      updateQuery += `, admin_notes = $${paramIdx++}`;
      updateParams.push(adminNotes);
    }

    if (priority) {
      if (!ALLOWED_PRIORITIES.includes(priority as any)) {
        return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
      }
      updateQuery += `, priority = $${paramIdx++}`;
      updateParams.push(priority);
    }

    updateQuery += ` WHERE id = $${paramIdx++} RETURNING *`;
    updateParams.push(numericId);

    const updateRes = await pool.query(updateQuery, updateParams);

    if (updateRes.rowCount === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (newStatus) {
      await pool.query(
        `
          INSERT INTO custom_design_request_events (request_id, status, changed_by)
          VALUES ($1, $2, 'admin')
        `,
        [numericId, newStatus]
      );
    }

    const updatedRequest = updateRes.rows[0];
    const customerEmail = updatedRequest.email_address;
    
    if (customerEmail && newStatus) {
      try {
        const { buildTransporter } = require("@/lib/email");
        const transporter = buildTransporter();
        
        const customerName = updatedRequest.full_name || "Customer";
        const productName = updatedRequest.product_title || "your custom design";
        
        let statusMessage = "";
        if (newStatus === "Pending") {
          statusMessage = "Your design request is currently in our queue and will be reviewed by our team shortly.";
        } else if (newStatus === "In Review") {
          statusMessage = "Our experts are currently reviewing your design requirements and reference materials.";
        } else if (newStatus === "Designing") {
          statusMessage = "Exciting news! Our master designers have started crafting the 3D model of your custom piece.";
        } else if (newStatus === "Completed") {
          statusMessage = "Your custom design has been successfully completed and is ready for the next steps.";
        } else if (newStatus === "Cancelled") {
          statusMessage = "Your custom design request has been cancelled. If you have any questions, please reach out to us.";
        }

        const htmlBody = `
          <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.6; padding: 20px;">
            <p>Hi ${customerName},</p>
            <p>Your custom jewelry design request for <strong>${productName}</strong> has been updated.</p>
            <p><strong>Current Status:</strong> ${newStatus}</p>
            <p>${statusMessage}</p>
            <br/>
            <p>Thank you for choosing Nexora Luxury Jewelry.</p>
            <p>Best Regards,<br /><strong>Nexora Luxury Jewelry</strong></p>
          </div>
        `;

        const textBody = `Hi ${customerName},\n\nYour custom jewelry design request for ${productName} has been updated.\n\nCurrent Status: ${newStatus}\n\n${statusMessage}\n\nThank you for choosing Nexora Luxury Jewelry.\n\nBest Regards,\nNexora Luxury Jewelry`;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customerEmail,
          subject: `Nexora – Status Update: ${newStatus}`,
          text: textBody,
          html: htmlBody,
        });
      } catch (emailErr) {
        console.error("Failed to send automatic status email:", emailErr);
      }
    }

    return NextResponse.json({ request: updatedRequest });
  } catch (err) {
    console.error("[custom-design] PUT failed:", err);
    return NextResponse.json(
      { error: "Failed to update custom design request" },
      { status: 500 }
    );
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

    await ensureCustomDesignSchema();

    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    const deleteRes = await pool.query(
      `
        DELETE FROM custom_design_requests
        WHERE id = $1
      `,
      [numericId]
    );

    if (deleteRes.rowCount === 0) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[custom-design] DELETE failed:", err);
    return NextResponse.json(
      { error: "Failed to delete custom design request" },
      { status: 500 }
    );
  }
}

