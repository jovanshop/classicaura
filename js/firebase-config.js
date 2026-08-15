/* =============================================
   CLASSIC AURA — Firebase Configuration
   =============================================
   Modular Firebase JS SDK (v9+ syntax), loaded from the official
   gstatic CDN as ES modules. No npm / build step required.

   Imports use absolute CDN URLs so this file works as a plain ES
   module on GitHub Pages (no import map needed).

   Usage from a classic script:
     import('./js/store-data.js').then(...)   // storefront data layer
     import('./js/migrate.js').then(...)      // one-time migration

   Only the PUBLIC client config lives here. Never commit Firebase
   Admin SDK private keys or Cloudinary API secrets in this repo.
   ============================================= */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyB8mWhLsOYOiZ-Et12o3SSop7uBDOqIagw',
  authDomain: 'classic-aura-bf3cd.firebaseapp.com',
  projectId: 'classic-aura-bf3cd',
  storageBucket: 'classic-aura-bf3cd.firebasestorage.app',
  messagingSenderId: '122453180015',
  appId: '1:122453180015:web:7f7f6418556170f7c5579a',
  measurementId: 'G-GRQQ3QHSLB',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, firebaseConfig };
