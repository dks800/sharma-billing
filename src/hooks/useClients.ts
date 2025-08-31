import { COLLECTIONS } from "../constants";
import { useFirestoreCollection } from "./useFirestoreCollection";

export function useClients(options = {}) {
  return useFirestoreCollection(COLLECTIONS?.CLIENTS, options);
}
