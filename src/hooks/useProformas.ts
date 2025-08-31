import { COLLECTIONS } from "../constants";
import { useFirestoreCollection } from "./useFirestoreCollection";

export function useProformas() {
  return useFirestoreCollection(COLLECTIONS?.PROFORMAS);
}
