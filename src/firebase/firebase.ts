import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA7zKs9piVEZ59f301ZfwL8dkpe0C-j6Os",
  authDomain: "onde-comprar-8e8c5.firebaseapp.com",
  projectId: "onde-comprar-8e8c5",
  storageBucket: "onde-comprar-8e8c5.firebasestorage.app",
  messagingSenderId: "111070192629",
  appId: "1:111070192629:web:bbd0aa8c426e4499b976bc"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
