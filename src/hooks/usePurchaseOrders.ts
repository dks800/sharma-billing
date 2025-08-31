import { COLLECTIONS } from "../constants";
import { useFirestoreCollection } from "./useFirestoreCollection";

export function usePurchaseOrders() {
  return useFirestoreCollection(COLLECTIONS?.PURCHASEORDERS);
}
