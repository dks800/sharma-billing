import { COLLECTIONS } from "../constants";
import { useFirestoreCollection } from "./useFirestoreCollection";

export function useQuotations(companyId: string, options = {}) {
  if (!companyId) return { data: [], loading: false, error: null };
  return useFirestoreCollection(
    `${COLLECTIONS.QUOTATIONS}/${companyId}`,
    options
  );
}