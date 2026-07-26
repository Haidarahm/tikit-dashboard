const LOCALIZED_FIELDS = [
  "title",
  "subtitle",
  "objective",
  "brief",
  "strategy",
  "approach",
];

/**
 * The admin listings return every translation instead of one pre-selected
 * language, so the language dropdown is resolved on the client: each localized
 * field falls back to English when the chosen language is empty.
 */
export function localizeSectionItem(item, lang = "en") {
  const localized = {};
  LOCALIZED_FIELDS.forEach((field) => {
    if (!(`${field}_en` in item)) return;
    localized[field] =
      item[`${field}_${lang}`] || item[`${field}_en`] || item[field] || "";
  });

  return {
    ...item,
    ...localized,
    main_image: item.main_image ?? item.logo ?? null,
    is_active: Boolean(item.is_active),
  };
}
