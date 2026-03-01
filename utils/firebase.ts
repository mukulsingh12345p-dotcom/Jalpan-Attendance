import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZQvhjjfqlj02rzRF3d-0PP0iKn2jS7GI",
  authDomain: "jalpsan-attendanvce.firebaseapp.com",
  projectId: "jalpsan-attendanvce",
  storageBucket: "jalpsan-attendanvce.firebasestorage.app",
  messagingSenderId: "40486775862",
  appId: "1:40486775862:web:4158ca442bbb23e5483c97",
  measurementId: "G-7S2E25DQLB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
