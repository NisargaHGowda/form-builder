import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

function logFirestore(context, err) {
  // Always log in dev — permission errors often don’t show in the Network tab clearly.
  console.error(`[Firestore: ${context}]`, err?.code, err?.message || err);
}

/**
 * Firestore rejects `undefined` field values. Strip them before writing.
 * @param {Record<string, unknown>} obj
 */
function omitUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
}

/**
 * @returns {Promise<import('firebase/firestore').DocumentReference>}
 */
export async function saveResponse(formId, payload) {
  const ref = collection(db, "forms", formId, "responses");
  const data = omitUndefined({
    answers: payload.answers,
    durationMs: payload.durationMs,
    submittedAt: serverTimestamp(),
  });

  try {
    const docRef = await addDoc(ref, data);
    console.info(
      `[Firestore] Saved response document: forms/${formId}/responses/${docRef.id}`
    );
    return docRef;
  } catch (err) {
    logFirestore("saveResponse", err);
    throw err;
  }
}

/**
 * @param {string} formId
 * @param {(docs: Array<{ id: string, answers?: object, submittedAt?: import('firebase/firestore').Timestamp, durationMs?: number }>) => void} onData
 * @param {(err: Error) => void} [onError]
 * @returns {() => void} unsubscribe
 */
export function subscribeToResponses(formId, onData, onError) {
  const ref = collection(db, "forms", formId, "responses");
  const q = query(ref, orderBy("submittedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(docs);
    },
    (err) => {
      logFirestore(`subscribe forms/${formId}/responses`, err);
      onError?.(err);
    }
  );
}
