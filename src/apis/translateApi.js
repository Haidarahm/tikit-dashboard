const TRANSLATE_API_URL =
  import.meta.env.VITE_TRANSLATE_API_URL || "http://translateapi.ai/api/v1";
const API_KEY = import.meta.env.VITE_TRANSLATE_API_KEY || "";

if (!API_KEY) {
  console.warn(
    "VITE_TRANSLATE_API_KEY is not set. Translation will fail without an API key."
  );
}

/**
 * Translate English text to both Arabic and French using TranslateAPI multi-target endpoint.
 * @param {string} text - English text to translate
 * @returns {Promise<{ ar: string, fr: string }>} Translated text in Arabic and French
 */
export async function translateEnToArAndFr(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return { ar: "", fr: "" };
  }

  if (!API_KEY) {
    throw new Error("TranslateAPI key is required. Please set VITE_TRANSLATE_API_KEY in your .env file.");
  }

  const response = await fetch(`${TRANSLATE_API_URL}/translate/multi/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text.trim(),
      target_languages: ["ar", "fr"],
      source_language: "en",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        `Translation failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return {
    ar: data.translations?.ar || "",
    fr: data.translations?.fr || "",
  };
}
