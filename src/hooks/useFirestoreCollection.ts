import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

export interface QueryOptions {
  limit?: number;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  startAfterDoc?: QueryDocumentSnapshot<DocumentData> | null;
  financialYear?: string;
  dateRange?: { start: Date; end: Date };
  where?: [string, any, any][];
}

export function useFirestoreCollection(
  collectionName: string,
  options: QueryOptions = {}
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  useEffect(() => {
    if (!collectionName) return;

    setLoading(true);
    setError(null);

    const colRef = collection(db, collectionName);
    const constraints: QueryConstraint[] = [];
    if (options.where && Array.isArray(options.where)) {
      options.where.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });
    }

    if (options.financialYear) {
      constraints.push(
        where("financialYear", "==", options.financialYear)
      );
    }

    if (options.dateRange?.start && options.dateRange?.end) {
      constraints.push(
        where("billDate", ">=", options.dateRange.start),
        where("billDate", "<=", options.dateRange.end)
      );
    }

    if (options.orderByField) {
      constraints.push(
        orderBy(options.orderByField, options.orderDirection || "asc")
      );
    }

    if (options.limit) {
      constraints.push(firestoreLimit(options.limit));
    }

    if (options.startAfterDoc) {
      constraints.push(startAfter(options.startAfterDoc));
    }

    const q = query(colRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(docsData);

        setLastDoc(
          snapshot.docs.length > 0
            ? snapshot.docs[snapshot.docs.length - 1]
            : null
        );

        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [
    collectionName,
    options.limit,
    options.orderByField,
    options.orderDirection,
    options.startAfterDoc,
    options.financialYear,
    options.dateRange?.start,
    options.dateRange?.end,
    JSON.stringify(options.where),
  ]);

  const addItem = async (item: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), item);
      return docRef.id;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateItem = async (id: string, updatedItem: any) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updatedItem);
    } catch (err) {
      setError(err as Error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      toast.success("Item deleted successfully!!");
    } catch (err) {
      setError(err as Error);
      toast.error("Failed to delete item!!");
    }
  };

  return { data, loading, error, addItem, updateItem, deleteItem, lastDoc };
}
