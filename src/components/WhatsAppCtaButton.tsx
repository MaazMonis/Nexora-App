import { DEFAULT_BUSINESS_WHATSAPP_NUMBER, buildWhatsAppUrl } from "@/lib/whatsapp";

type WhatsAppCtaButtonProps = {
  label: string;
  message: string;
  phoneNumber?: string;
  className?: string;
};

export default function WhatsAppCtaButton({
  label,
  message,
  phoneNumber = DEFAULT_BUSINESS_WHATSAPP_NUMBER,
  className,
}: WhatsAppCtaButtonProps) {
  const href = buildWhatsAppUrl(phoneNumber, message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={label}
    >
      {label}
    </a>
  );
}

