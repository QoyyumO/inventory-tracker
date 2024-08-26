import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDGxVlMN0fT-wflej_As_Fjd94JoRplKV8",
    authDomain: "inventry-tracker.firebaseapp.com",
    projectId: "inventry-tracker",
    storageBucket: "inventry-tracker.appspot.com",
    messagingSenderId: "240030920391",
    appId: "1:240030920391:web:8bd18540d1b031d80718e2"
  };

const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app.name);
export const auth = getAuth(app);
export const firestore = getFirestore(app);