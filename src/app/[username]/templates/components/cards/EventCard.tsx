import { toForeground } from "./utils/style";

interface EventCardProps {
  event: any;
  customPresets?: any;
  buttonStyle?: React.CSSProperties;
}

const REJECTED_URLS = /^(https?:\/\/|mailto:|tel:|\/\/)/i;

function normalizeExternalUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }
  if (REJECTED_URLS.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function EventCard({ event, customPresets, buttonStyle }: EventCardProps) {
  const cornerValue = customPresets?.customButtonCorners || "12";
  const href = normalizeExternalUrl(event?.externalLink);
  const mutedTextColor = toForeground(String(customPresets?.customButtonTextColor || "#0f0f0f"));

  const dateLabel = (() => {
    try {
      const d = new Date(event?.eventDate);
      return d.toLocaleDateString("pt-BR");
    } catch {
      return event?.eventDate;
    }
  })();

  if (href) {
    return (
      <a
        className="block border p-4 shadow"
        href={href}
        rel="noopener noreferrer"
        style={{ borderRadius: `${cornerValue}px`, ...(buttonStyle || {}) }}
        target="_blank"
      >
        <h3 className="font-bold text-lg">{event?.title}</h3>
        <div className="text-sm" style={{ color: mutedTextColor }}>{event?.location}</div>
        <div className="text-sm" style={{ color: mutedTextColor }}>{dateLabel} • {event?.eventTime}</div>
      </a>
    );
  }

  return (
    <div className="border p-4 shadow" style={{ borderRadius: `${cornerValue}px`, ...(buttonStyle || {}) }}>
      <h3 className="font-bold text-lg">{event?.title}</h3>
      <div className="text-sm" style={{ color: mutedTextColor }}>{event?.location}</div>
      <div className="text-sm" style={{ color: mutedTextColor }}>{dateLabel} • {event?.eventTime}</div>
    </div>
  );
}
