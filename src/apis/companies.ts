import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface Company {
  id?: string;
  name: string;
  gstin: string;
  address: string;
  phone: string;
  taxType: string;
  city?: string;
  createdAt?: any;
  updatedAt?: any;
}

export async function getUserCompanies(userId: string): Promise<Company[]> {
  const companiesRef = collection(db, "users", userId, "companies");
  const q = query(companiesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const companies: Company[] = [];
  snapshot.forEach((doc) => {
    companies.push({ id: doc.id, ...(doc.data() as Company) });
  });
  return companies;
}

export async function addCompany(userId: string, company: Company): Promise<string> {
  const companiesRef = collection(db, "users", userId, "companies");
  const docRef = await addDoc(companiesRef, {
    ...company,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCompany(userId: string, companyId: string, data: Partial<Company>): Promise<void> {
  const companyDoc = doc(db, "users", userId, "companies", companyId);
  await updateDoc(companyDoc, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCompany(userId: string, companyId: string): Promise<void> {
  const companyDoc = doc(db, "users", userId, "companies", companyId);
  await deleteDoc(companyDoc);
}
