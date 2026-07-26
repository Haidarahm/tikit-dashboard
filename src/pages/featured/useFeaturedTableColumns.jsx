import { useSectionItemColumns } from "../../components/content/useSectionItemColumns.jsx";

/**
 * Featured campaigns share their table layout with showcase projects.
 * @param {Parameters<typeof useSectionItemColumns>[0]} params
 */
export function useFeaturedTableColumns(params) {
  return useSectionItemColumns({ ...params, entityNoun: "campaign" });
}
