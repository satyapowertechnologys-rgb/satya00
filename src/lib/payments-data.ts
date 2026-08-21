import { useEffect, useState, useCallback } from "react";
import {
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { getFirebase } from "./firebase";
import { isFirebaseConfigured } from "./admin-data";

export interface PaymentRecord {
  id?: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  description: string;
  razorpayPaymentId: string;
  status: string;
  createdAt: any;
}

export const RAZORPAY_CONFIG = {
  keyId: "rzp_live_TA9yXL3CUgQc5d",
  keySecret: "lyIEnQpgueOcEdiBr1yF2NNg", // Stored for documentation reference, not exposed in Razorpay Standard checkout script initialization.
};

const LOCAL_KEY = "satya-payments-cache";

function readLocalPayments(): PaymentRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function writeLocalPayments(list: PaymentRecord[]) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  }
}

export function usePayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>(() => readLocalPayments());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fb = getFirebase();
    if (!fb || !isFirebaseConfigured()) return;
    
    // Only fetch payments list if an admin user is logged in
    // This prevents the "Missing or insufficient permissions" error for public users
    if (!fb.auth.currentUser) {
       return;
    }

    setLoading(true);
    const q = query(collection(fb.db, "payments"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate 
              ? data.createdAt.toDate().toISOString() 
              : data.createdAt || new Date().toISOString(),
          };
        }) as PaymentRecord[];

        setPayments(list);
        writeLocalPayments(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Payments subscription error:", err);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  const savePayment = useCallback(async (data: Omit<PaymentRecord, "createdAt">) => {
    const fb = getFirebase();
    const record = {
      ...data,
      createdAt: serverTimestamp(),
    };

    if (!fb || !isFirebaseConfigured()) {
      const local = [
        { ...record, id: `local-${Date.now()}`, createdAt: new Date().toISOString() },
        ...readLocalPayments(),
      ];
      writeLocalPayments(local);
      setPayments(local);
      return;
    }

    try {
      await addDoc(collection(fb.db, "payments"), record);
    } catch (err) {
      console.error("Failed to save payment to Firestore:", err);
      throw err;
    }
  }, []);

  return { payments, loading, savePayment };
}
