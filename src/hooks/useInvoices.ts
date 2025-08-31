import { COLLECTIONS } from "../constants";
import { useFirestoreCollection } from "./useFirestoreCollection";

export function useInvoices(companyId: string, options = {}) {
  if (!companyId) return { data: [], loading: false, error: null };
  return useFirestoreCollection(
    `${COLLECTIONS.INVOICES}/${companyId}`,
    options
  );
}

const defaultReturn = {
  data: [] as any[],
  loading: false,
  error: null,
  lastDoc: null,
  addItem: async () => {},
  updateItem: async () => {},
  deleteItem: async () => {},
};

export function useSalesBill(companyId: string, options = {}) {
  if (!companyId) return defaultReturn;
  return useFirestoreCollection(
    `${COLLECTIONS.INVOICES}/${companyId}/${COLLECTIONS.SALES_BILL}`,
    options
  );
}

export function usePurchaseBill(companyId: string, options = {}) {
  if (!companyId) return defaultReturn;
  return useFirestoreCollection(
    `${COLLECTIONS.INVOICES}/${companyId}/${COLLECTIONS.PURCHASE_BILL}`,
    options
  );
}
