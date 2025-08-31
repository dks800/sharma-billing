import { COLLECTIONS } from "../constants";
import { useFirestoreCollection } from "./useFirestoreCollection";

export function useCompanies() {
  return useFirestoreCollection(COLLECTIONS?.COMPANIES);
}
