export const WORK_INFLUENCE_SECTION = "work_influence";
export const SHOWCASE_PROJECT_SECTION = "showcase_project";
export const FEATURED_CAMPAIGN_SECTION = "featured_campaign";

export const SECTION_PREFIXES = {
  [WORK_INFLUENCE_SECTION]: "/work-influences",
  [SHOWCASE_PROJECT_SECTION]: "/showcase-projects",
  [FEATURED_CAMPAIGN_SECTION]: "/featured",
};

export const SECTION_LABELS = {
  [WORK_INFLUENCE_SECTION]: "Work Influence",
  [SHOWCASE_PROJECT_SECTION]: "Showcase Project",
  [FEATURED_CAMPAIGN_SECTION]: "Featured Campaign",
};

/** Used when GET /content-sections is unavailable. */
export const FALLBACK_SECTION_OPTIONS = [
  {
    key: WORK_INFLUENCE_SECTION,
    label: SECTION_LABELS[WORK_INFLUENCE_SECTION],
    requires_work_id: true,
  },
  {
    key: SHOWCASE_PROJECT_SECTION,
    label: SECTION_LABELS[SHOWCASE_PROJECT_SECTION],
    requires_work_id: false,
  },
  {
    key: FEATURED_CAMPAIGN_SECTION,
    label: SECTION_LABELS[FEATURED_CAMPAIGN_SECTION],
    requires_work_id: false,
  },
];

const DROPPED_FIELD_LABELS = {
  approach_en: "Approach (EN)",
  approach_ar: "Approach (AR)",
  approach_fr: "Approach (FR)",
  work_id: "Linked work",
  sort_order: "Sort order",
  logo: "Logo",
};

export function sectionPrefix(section) {
  const prefix = SECTION_PREFIXES[section];
  if (!prefix) {
    throw new Error(`Unknown content section: ${section}`);
  }
  return prefix;
}

export function sectionLabel(section) {
  return SECTION_LABELS[section] || section;
}

/**
 * Turns the backend `meta.dropped_fields` list into a readable warning, or null
 * when nothing was lost during the copy/move.
 */
export function buildDroppedFieldsWarning(meta) {
  const dropped = Array.isArray(meta?.dropped_fields) ? meta.dropped_fields : [];
  if (dropped.length === 0) {
    return null;
  }
  const labels = dropped.map((field) => DROPPED_FIELD_LABELS[field] || field);
  return `Some fields are not supported by the destination section and were dropped: ${labels.join(
    ", "
  )}`;
}
