import { useMemo } from "react";
import { COLLECTIONS } from "../constants";
import { useFirestoreCollection } from "./useFirestoreCollection";

const defaultReturn = {
  data: [] as any[],
  loading: false,
  error: null,
  lastDoc: null,
  addItem: async () => {},
  updateItem: async () => {},
  deleteItem: async () => {},
};

/* ---------------------- INVOICES ROOT ---------------------- */

export function useInvoices(companyId: string, options = {}) {
  const path = useMemo(() => {
    return companyId ? `${COLLECTIONS.INVOICES}/${companyId}` : null;
  }, [companyId]);

  if (!path) return defaultReturn;

  return useFirestoreCollection(path, options);
}

/* ---------------------- SALES BILL ---------------------- */

export function useSalesBill(companyId: string, options = {}) {
  const path = useMemo(() => {
    return companyId
      ? `${COLLECTIONS.INVOICES}/${companyId}/${COLLECTIONS.SALES_BILL}`
      : null;
  }, [companyId]);

  if (!path) return defaultReturn;

  return useFirestoreCollection(path, options);
}

/* ---------------------- PURCHASE BILL ---------------------- */

export function usePurchaseBill(companyId: string, options = {}) {
  const path = useMemo(() => {
    return companyId
      ? `${COLLECTIONS.INVOICES}/${companyId}/${COLLECTIONS.PURCHASE_BILL}`
      : null;
  }, [companyId]);

  if (!path) return defaultReturn;

  return useFirestoreCollection(path, options);
}

/* ---------------------- QUOTATIONS ---------------------- */

export function useQuotations(companyId: string, options = {}) {
  const path = useMemo(() => {
    return companyId
      ? `${COLLECTIONS.INVOICES}/${companyId}/${COLLECTIONS.QUOTATIONS}`
      : null;
  }, [companyId]);

  if (!path) return defaultReturn;
  
  return useFirestoreCollection(path, options);
}

/* ---------------------- CLIENTS FOR QUOTATIONS ---------------------- */

export function useClientsForQuotations() {
  return useFirestoreCollection(
    `${COLLECTIONS.INVOICES}/24AWKPS0186R1ZQ/${COLLECTIONS.CLIENTSFORQUOTATION}`
  );
}

/* ---------------------- LETTER PAD ---------------------- */

export function useLetterpads(companyId: string, options = {}) {
  const path = useMemo(() => {
    return companyId
      ? `${COLLECTIONS.INVOICES}/${companyId}/${COLLECTIONS.LETTERPAD}`
      : null;
  }, [companyId]);

  if (!path) return defaultReturn;

  return useFirestoreCollection(path, options);
}
