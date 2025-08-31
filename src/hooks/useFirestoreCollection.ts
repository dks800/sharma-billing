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
} from "firebase/firestore";
import { db } from "../firebase";

export interface QueryOptions {
  limit?: number;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  startAfterDoc?: QueryDocumentSnapshot<DocumentData> | null;
  financialYear?: string;
  companyId?: string;
  dateRange?: { start: Date; end: Date };
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
    setLoading(true);
    setError(null);

    const colRef = collection(db, collectionName);

    const constraints: QueryConstraint[] = [];

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
        // Map data without docSnapshot in each item
        const docsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(docsData);

        // Set lastDoc snapshot separately
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        } else {
          setLastDoc(null);
        }

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
  ]);

  // CRUD functions
  const addItem = async (item: any) => {
    try {
      await addDoc(collection(db, collectionName), item);
    } catch (err) {
      setError(err as Error);
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
    } catch (err) {
      setError(err as Error);
    }
  };

  return { data, loading, error, addItem, updateItem, deleteItem, lastDoc };
}
