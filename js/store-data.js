/* =============================================
   CLASSIC AURA — Firestore Product Data Layer
   =============================================
   Shared storefront data layer. Loads the product catalog from the
   Firestore `products` collection and exposes it to the classic scripts
   (js/main.js etc.) through window.STORE_PRODUCTS plus a custom event.

   Fallback behavior: if Firestore is unreachable or returns an empty
   collection, the static catalog (js/products.js) is used instead, so the
   storefront always renders something. This file is an ES module and works
   as a plain script on GitHub Pages (no build step).
   ============================================= */

import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

const STORE_READY_EVENT = 'classicaura:store-ready';

/* Normalize a Firestore document (or a static catalog entry) into the
   shape the storefront expects. Always ensures a non-negative numeric
   `discountAmount` (flat Taka discount, default 0). */
function normalizeProduct(id, data) {
  const price = Number(data.price) || 0;
  const discountAmount = Math.max(0, Number(data.discountAmount) || 0);
  const images =
    Array.isArray(data.images) && data.images.length
      ? data.images
      : data.image
        ? [data.image]
        : [];
  return {
    ...data,
    id: id || data.id,
    price,
    discountAmount,
    image: data.image || images[0] || '',
    images,
    variants: Array.isArray(data.variants) ? data.variants : [],
  };
}

/* Static catalog fallback. PRODUCTS is a top-level `const` in a classic
   script, so it is reachable as a bare identifier (not window.PRODUCTS). */
function getStaticFallback() {
  if (typeof PRODUCTS === 'undefined' || !Array.isArray(PRODUCTS)) return [];
  return PRODUCTS.map((p) => normalizeProduct(p && p.id, p));
}

function setStore(products, source) {
  window.STORE_PRODUCTS = products;
  window.STORE_DATA_SOURCE = source;
  window.dispatchEvent(
    new CustomEvent(STORE_READY_EVENT, { detail: { products, source } })
  );
}

async function loadProducts() {
  let products;
  let source;
  try {
    const snap = await getDocs(collection(db, 'products'));
    const list = [];
    snap.forEach((doc) => list.push(normalizeProduct(doc.id, doc.data())));
    if (!list.length) throw new Error('Empty products collection');
    products = list;
    source = 'firestore';
  } catch (err) {
    console.warn(
      '[classic-aura] Firestore unavailable, falling back to static catalog:',
      err
    );
    products = getStaticFallback();
    source = 'static';
  }
  setStore(products, source);
  return products;
}

function getProducts() {
  if (window.STORE_PRODUCTS && window.STORE_PRODUCTS.length) {
    return window.STORE_PRODUCTS;
  }
  return getStaticFallback();
}

function getProductById(id) {
  return getProducts().find((p) => p.id === id) || null;
}

loadProducts();

export {
  loadProducts,
  getProducts,
  getProductById,
  normalizeProduct,
  STORE_READY_EVENT,
};
