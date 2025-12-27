import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJxXgS4184yrnExs7UF6sZm84o7wZpZYs",
  authDomain: "secret-bangkog.firebaseapp.com",
  projectId: "secret-bangkog",
  storageBucket: "secret-bangkog.firebasestorage.app",
  messagingSenderId: "895000271372",
  appId: "1:895000271372:web:a0bbac71412a820a5eac29",
  measurementId: "G-NLEQ5MN75P"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence enabled (multi-tab support)
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

const storage = getStorage(app);

export { db, storage };
