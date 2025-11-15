import type React from "react";

export type CustomPresets = {
  customBackgroundColor?: string;
  customBackgroundGradient?: string;
  customTextColor?: string;
  customFont?: string;
  customButton?: string;
  customButtonFill?: string;
  customButtonCorners?: string;
  customButtonColor?: string;
  customButtonTextColor?: string;
  customButtonStyle?: string;
};

const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGBA_COLOR_REGEX = /^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i;

export function getAspectRatioStyle(ratio?: string): React.CSSProperties {
  switch (ratio) {
    case "square":
      return { aspectRatio: "1 / 1" };
    case "16:9":
      return { aspectRatio: "16 / 9" };
    case "3:2":
      return { aspectRatio: "3 / 2" };
    case "3:1":
      return { aspectRatio: "3 / 1" };
    default:
      return {};
  }
}

export function toForeground(c: string, alpha = 0.7): string {
  const rgb = parseRgb(c);
  if (!rgb) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function parseRgb(c: string): { r: number; g: number; b: number } | null {
  const hexMatch = c.match(HEX_COLOR_REGEX);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((ch) => ch + ch)
        .join("");
    }
    const rHex = hex.slice(0, 2);
    const gHex = hex.slice(2, 4);
    const bHex = hex.slice(4, 6);
    return {
      r: Number.parseInt(rHex, 16),
      g: Number.parseInt(gHex, 16),
      b: Number.parseInt(bHex, 16),
    };
  }
  const rgbMatch = c.match(RGBA_COLOR_REGEX);
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }
  return null;
}

export function buildCompactButtonStyle(
  customPresets: CustomPresets,
  buttonStyle?: React.CSSProperties
): React.CSSProperties {
  const cornerValue = customPresets.customButtonCorners || "12";
  const borderRadiusValue = `${cornerValue}px`;
  const buttonColor = customPresets.customButtonColor || "#ffffff";
  const textColor = customPresets.customButtonTextColor || "#000000";

  const baseStyle: React.CSSProperties = {
    borderRadius: borderRadiusValue,
    ...(buttonStyle || {}),
  };

  switch (customPresets.customButtonStyle) {
    case "solid":
      return { ...baseStyle, backgroundColor: buttonColor, border: "none", color: textColor };
    case "outline":
      return { ...baseStyle, backgroundColor: "transparent", border: `2px solid ${buttonColor}`, color: textColor };
    case "soft":
      return { ...baseStyle, backgroundColor: `${buttonColor}20`, border: `1px solid ${buttonColor}40`, color: textColor };
    case "shadow":
      return {
        ...baseStyle,
        backgroundColor: `${buttonColor}30`,
        border: `1px solid ${buttonColor}50`,
        color: textColor,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      };
    case "neon":
      return { ...baseStyle, backgroundColor: "transparent", border: `2px solid ${buttonColor}`, color: textColor, boxShadow: `0 0 8px ${buttonColor}40` };
    case "dashed":
      return { ...baseStyle, backgroundColor: "transparent", border: `2px dashed ${buttonColor}`, color: textColor };
    case "double":
      return { ...baseStyle, backgroundColor: "transparent", border: `4px double ${buttonColor}`, color: textColor };
    case "raised":
      return {
        ...baseStyle,
        backgroundColor: `${buttonColor}40`,
        borderTop: `2px solid ${buttonColor}`,
        borderLeft: `2px solid ${buttonColor}`,
        borderRight: `1px solid ${buttonColor}80`,
        borderBottom: `1px solid ${buttonColor}80`,
        color: textColor,
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
      };
    case "inset":
      return {
        ...baseStyle,
        backgroundColor: `${buttonColor}40`,
        borderBottom: `2px solid ${buttonColor}`,
        borderRight: `2px solid ${buttonColor}`,
        borderTop: `1px solid ${buttonColor}80`,
        borderLeft: `1px solid ${buttonColor}80`,
        color: textColor,
        boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.2)",
      };
    default:
      switch (customPresets.customButtonFill) {
        case "filled":
          return { ...baseStyle, backgroundColor: buttonColor, border: "none", color: textColor };
        case "outlined":
          return { ...baseStyle, backgroundColor: "transparent", border: "2px solid currentColor", color: textColor };
        case "gradient":
          return {
            ...baseStyle,
            backgroundColor: "transparent",
            backgroundImage:
              customPresets.customBackgroundGradient ||
              "linear-gradient(135deg, #c026d3 0%, #7c3aed 50%, #2563eb 100%)",
            border: "none",
            color: textColor,
          };
        default:
          return { ...baseStyle, backgroundColor: buttonColor, border: "none", color: textColor };
      }
  }
}

export function buildBorderRadiusStyle(
  customButtonCorners?: string
): React.CSSProperties | undefined {
  if (!customButtonCorners) {
    return;
  }
  const cornerValue = customButtonCorners || "12";
  const borderRadiusValue = `${cornerValue}px`;
  return { borderRadius: borderRadiusValue };
}

export function resolveTextClasses(
  customPresets?: CustomPresets,
  hasBackground?: boolean,
  classNames?: { cardTextClasses?: string; textClasses?: string }
): string {
  if (customPresets?.customTextColor) {
    return "";
  }
  if (hasBackground && classNames?.cardTextClasses) {
    return classNames.cardTextClasses || "";
  }
  return classNames?.textClasses || "";
}

export function composeCardClasses(
  customPresets?: CustomPresets,
  classNames?: { cardClasses?: string; textCard?: string }
): string {
  const baseClasses = "border transition-all shadow";
  const cornerClasses = customPresets?.customButtonCorners || "rounded-xl";
  const backgroundClasses = customPresets?.customButtonFill ? "" : classNames?.cardClasses || "";
  return [baseClasses, cornerClasses, backgroundClasses, classNames?.textCard || ""].filter(Boolean).join(" ");
}