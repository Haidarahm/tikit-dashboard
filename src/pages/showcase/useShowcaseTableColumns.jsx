import { useSectionItemColumns } from "../../components/content/useSectionItemColumns.jsx";

/**
 * Showcase projects share their table layout with featured campaigns.
 * @param {Parameters<typeof useSectionItemColumns>[0]} params
 */
export function useShowcaseTableColumns(params) {
  return useSectionItemColumns({ ...params, entityNoun: "project" });
}
