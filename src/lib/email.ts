import nodemailer from "nodemailer";

export const buildTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const service = process.env.EMAIL_SERVICE;
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "", 10);
  const secure = process.env.EMAIL_SECURE === "true";

  if (!user || !pass) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variable.");
  }

  if (host) {
    return nodemailer.createTransport({
      host,
      port: port || 587,
      secure: typeof process.env.EMAIL_SECURE !== "undefined" ? secure : false,
      auth: { user, pass },
      requireTLS: true,
      tls: { rejectUnauthorized: false },
    });
  }

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

export const formatHtml = (customerName: string, productName: string, status: string, message: string) => {
  const safeMessage = message
    ? message.replace(/\n/g, "<br />")
    : "No additional details provided.";

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.6; padding: 20px;">
      <p>Hi ${customerName || "Customer"},</p>
      <p>Your custom jewelry design request for <strong>${productName || "your custom design"}</strong> has been updated.</p>
      <p><strong>Current Status:</strong> ${status || "Pending"}</p>
      <p>${safeMessage}</p>
      <br/>
      <p>Thank you for choosing Nexora Luxury Jewelry.</p>
      <p>Best Regards,<br /><strong>Nexora Luxury Jewelry</strong></p>
    </div>
  `;
};

export const formatText = (customerName: string, productName: string, status: string, message: string) => {
  return `Hi ${customerName || "Customer"},\n\nYour custom jewelry design request for ${productName || "your custom design"} has been updated.\n\nCurrent Status: ${status || "Pending"}\n\n${message || "No additional details provided."}\n\nThank you for choosing Nexora Luxury Jewelry.\n\nBest Regards,\nNexora Luxury Jewelry`;
};
