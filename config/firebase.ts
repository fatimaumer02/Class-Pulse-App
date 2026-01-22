// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7N1aZhX0DKBRXKUHceG7qCKyWSavyBp8",
  authDomain: "hackathonapp-679cd.firebaseapp.com",
  projectId: "hackathonapp-679cd",
  storageBucket: "hackathonapp-679cd.firebasestorage.app",
  messagingSenderId: "300393961550",
  appId: "1:300393961550:web:c6039dae7b71395aa8cb1f",
  measurementId: "G-LBSFYNV61C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app)
 

//db
export const firestore =  getFirestore(app);
