import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { COLLECTIONS } from "../constants";

export async function getNextBillNumber(companyId: string) {
  const fy = getFinancialYear(); // returns "2025-2026"
  const ref = collection(
    db,
    `${COLLECTIONS.INVOICES}/${companyId}/${COLLECTIONS.SALES_BILL}`
  );
  const q = query(
    ref,
    where("financialYear", "==", fy), // <-- fixed here
    orderBy("billNumber", "desc"),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    console.log(
      "snapshot.docs[0].data().billNumber --->>",
      snapshot.docs[0].data().billNumber
    );
    const billNumber = snapshot.docs[0].data().billNumber;
    return !isNaN(Number(billNumber)) ? String(Number(billNumber) + 1) : "1";
  }
  return "1";
}

function getFinancialYearStart() {
  const now = new Date();
  const year = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  return `${year}-04-01`;
}

export function getFinancialYear(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (month <= 3) {
    return `${year - 1}-${year}`;
  }
  return `${year}-${year + 1}`;
}
