export const EMPTY_TRANSLATION_FIELDS = {
  title_ar: "",
  title_fr: "",
  subtitle_ar: "",
  subtitle_fr: "",
  description_ar: "",
  description_fr: "",
};

/**
 * @param {(text: string) => Promise<{ ar?: string; fr?: string } | null>} translateText
 */
export async function translateWorksSectionFields(translateText, fields) {
  const { title_en, subtitle_en, description_en } = fields;
  const out = { ...EMPTY_TRANSLATION_FIELDS };

  const translatePlain = async (text, field) => {
    if (!text || !String(text).trim()) return;
    const result = await translateText(String(text).trim());
    if (result) {
      out[`${field}_ar`] = result.ar ?? "";
      out[`${field}_fr`] = result.fr ?? "";
    }
  };

  await translatePlain(title_en, "title");
  await translatePlain(subtitle_en, "subtitle");
  await translatePlain(description_en, "description");

  return out;
}
