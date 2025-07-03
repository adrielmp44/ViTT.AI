// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
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
const analytics = getAnalytics(app);
const db = getFirestore(app);
// Export a referência ao banco de dados
export { db };