import { buildTransporter, formatHtml, formatText } from "@/lib/email";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      productName,
      status,
      message,
    } = body;

    if (!customerEmail) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing customer email address." }),
        { status: 400 }
      );
    }

    const transporter = buildTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: "Nexora – Custom 3D Design Request Update",
      text: formatText(customerName, productName, status, message),
      html: formatHtml(customerName, productName, status, message),
    };

    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("send-email error:", error);
    const message = error?.message || "Email failed to send.";

    return new Response(
      JSON.stringify({ success: false, message }),
      { status: 500 }
    );
  }
}