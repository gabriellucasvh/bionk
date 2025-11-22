export type Locale = "pt-br" | "en" | "es";

export function normalizeLocale(v: string | undefined | null): Locale {
  const s = String(v || "pt-br").toLowerCase();
  if (s === "pt" || s === "pt_br" || s === "pt-br") {
    return "pt-br";
  }
  if (s === "en" || s === "en-us" || s === "en_us") {
    return "en";
  }
  if (s === "es" || s === "es-es" || s === "es_es") {
    return "es";
  }
  return "pt-br";
}

export async function getDictionary<T = any>(locale: Locale, ns: string): Promise<T> {
  const l = normalizeLocale(locale);
  const mod = await import(`../dictionaries/public/${l}/${ns}.ts`);
  return mod.default as T;
}

