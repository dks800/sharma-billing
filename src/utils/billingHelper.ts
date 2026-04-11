import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../constants";

export async function getNextBillNumber(
  companyId: string,
  identifier: string,
  collectionName: string,
) {
  const fy = getFinancialYear();
  const ref = collection(
    db,
    `${COLLECTIONS.INVOICES}/${companyId}/${[collectionName]}`,
  );

  const constraints: QueryConstraint[] = [
    orderBy(identifier, "desc"),
    limit(1),
  ];

  if (collectionName !== COLLECTIONS.QUOTATIONS) {
    constraints.unshift(where("financialYear", "==", fy));
  }

  const q = query(ref, ...constraints);

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const billNumber = snapshot.docs[0].data()?.[identifier];
    return !isNaN(Number(billNumber)) ? String(Number(billNumber) + 1) : "1";
  }
  return "1";
}

export function getFinancialYear(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (month <= 3) {
    return `${year - 1}-${year}`;
  }
  return `${year}-${year + 1}`;
}
