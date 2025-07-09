
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQkJa7_bGF95eoB52vGEQO2F0aXENUN7s",
  authDomain: "vittai.firebaseapp.com",
  projectId: "vittai",
  storageBucket: "vittai.firebasestorage.app",
  messagingSenderId: "530626960651",
  appId: "1:530626960651:web:b7cded99397a139bbcd60e",
  measurementId: "G-Q7QNQDTWRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);