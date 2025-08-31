import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// ===== Types (optional) =====
export interface Invoice {
  id?: string;
  customerName: string;
  date: string;
  amount: number;
  gstRate: number;
}

export interface Proforma {
  id?: string;
  customerName: string;
  date: string;
  amount: number;
  gstRate: number;
}

export interface PurchaseOrder {
  id?: string;
  supplierName: string;
  date: string;
  amount: number;
  gstRate: number;
}

export interface Quotation {
  id?: string;
  supplierName: string;
  date: string;
  amount: number;
  gstRate: number;
}

// ====== Generic CRUD helper ======
const getCollectionRef = (colName: string) => collection(db, colName);

export const addDocument = async (colName: string, data: any) => {
  const docRef = await addDoc(getCollectionRef(colName), data);
  return docRef.id;
};

export const getAllDocuments = async (colName: string) => {
  const querySnapshot = await getDocs(getCollectionRef(colName));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getDocumentById = async (colName: string, id: string) => {
  const docRef = doc(db, colName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Document not found");
  }
};

export const updateDocument = async (
  colName: string,
  id: string,
  data: any
) => {
  const docRef = doc(db, colName, id);
  await updateDoc(docRef, data);
};

export const deleteDocument = async (colName: string, id: string) => {
  const docRef = doc(db, colName, id);
  await deleteDoc(docRef);
};
