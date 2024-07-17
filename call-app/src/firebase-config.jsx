// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyAmNOc7TkF8B_PKryuEN3fv3SleWjstqjU",
  authDomain: "callapp-ca08d.firebaseapp.com",
  projectId: "callapp-ca08d",
  storageBucket: "callapp-ca08d.appspot.com",
  messagingSenderId: "506463848599",
  appId: "1:506463848599:web:e33085f98d648e0d25c1d2",
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const db = getDatabase(app);

export const updateBalance = async (userId, amount) => {
    const userDoc = doc(firestore, 'users', userId);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
         const currentBalance = userSnapshot.data().balance;
         await updateDoc(userDoc, {
             balance: currentBalance + amount,
         });
    }  else {
          console.error("User not found");
    }
};

export const getBalance = async (userId) => {
  const userDoc = doc(firestore, 'users', userId);
  const userSnapshot = await getDoc(userDoc);
  if (userSnapshot.exists()) {
      return userSnapshot.data().balance;
  } else {
      console.error("User not found");
      return null;
  }
};

export { auth, db, firestore };
