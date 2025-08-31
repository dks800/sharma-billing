import { COLLECTIONS } from "../constants";
import { useFirestoreCollection } from "./useFirestoreCollection";

export function useQuotations() {
  return useFirestoreCollection(COLLECTIONS?.QUOTATIONS);
}
