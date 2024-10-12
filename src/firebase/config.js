//* Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

//* Add the Web App's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEI9EJ8F4CuvcGSMPu8GAmtVcZVhBCbmQ",
  authDomain: "rscbot-3cf09.firebaseapp.com",
  projectId: "rscbot-3cf09",
  storageBucket: "rscbot-3cf09.appspot.com",
  messagingSenderId: "638919619704",
  appId: "1:638919619704:web:fa9611b74c31d18691a98d",
  measurementId: "G-6MF3F3M614"
};

//* Initialize Firebase
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

//* Initialize Firebase Auth and set persistence
const auth = getAuth(firebase_app);
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Session persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Failed to set session persistence:", error);
  });

export { auth };
export default firebase_app;
