export const DEFAULT_BUSINESS_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "03308577538";

export function normalizeWhatsAppNumber(input: string) {
  // WhatsApp wa.me expects digits; strip spaces, plus, dashes, etc.
  return (input || "").replace(/[^\d]/g, "");
}

export function buildWhatsAppUrl(phoneNumber: string, message: string) {
  const normalized = normalizeWhatsAppNumber(phoneNumber);
  const text = encodeURIComponent(message || "");
  return `https://wa.me/${normalized}?text=${text}`;
}

