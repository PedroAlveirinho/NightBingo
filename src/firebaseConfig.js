// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBePWa_mLCevLgTRGQXZFhBopoMXOMDRqk",
  authDomain: "nightbingo-46ad6.firebaseapp.com",
  projectId: "nightbingo-46ad6",
  storageBucket: "nightbingo-46ad6.appspot.com",
  messagingSenderId: "340201665569",
  appId: "1:340201665569:web:9252e8b1b0868ae5f01f60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

export { app, firestore };
