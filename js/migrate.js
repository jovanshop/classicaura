/* =============================================
   CLASSIC AURA — One-time Product Migration
   =============================================
   Reads the static catalog (js/products.js global `PRODUCTS`) and
   writes every product into the Firestore "products" collection.

   SAFEGUARD AGAINST DUPLICATES:
   Each Firestore document uses product.id as its document ID and we
   write with setDoc() + { merge: true } (an upsert). Re-running the
   migration can therefore never create duplicate documents — it simply
   overwrites the same IDs in place. An optional `force` flag can force
   an overwrite; otherwise an existing document is left untouched so the
   migration is a true one-time import.

   Requires a signed-in Firebase user (writes are restricted to
   authenticated users by the security rules).
   ============================================= */

import { db } from './firebase-config.js';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  limit,
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

/**
 * Run the one-time migration.
 * @param {boolean} force  Overwrite existing documents (default false).
 * @returns {Promise<{migrated:number, alreadyExisted:number}>}
 */
export async function runMigration(force = false) {
  const source = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []) || [];
  const col = collection(db, 'products');

  let migrated = 0;
  let alreadyExisted = 0;

  for (const product of source) {
    if (!product || !product.id) continue;

    const ref = doc(col, product.id);

    if (!force) {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        alreadyExisted += 1;
        continue;
      }
    }

    const payload = {
      ...product,
      discountAmount: Number(product.discountAmount) || 0,
    };

    await setDoc(ref, payload, { merge: true });
    migrated += 1;
  }

  return { migrated, alreadyExisted };
}

/**
 * Check whether any products already exist in Firestore.
 * @returns {Promise<boolean>}
 */
export async function hasProducts() {
  const col = collection(db, 'products');
  const snapshot = await getDocs(query(col, limit(1)));
  return !snapshot.empty;
}
