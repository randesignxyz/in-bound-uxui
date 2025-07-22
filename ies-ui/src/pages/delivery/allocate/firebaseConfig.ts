// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQJ5uHg8cmAohLw7GVItDwnlzbLHbE0K4",
  authDomain: "delivery-dev-e0320.firebaseapp.com",
  projectId: "delivery-dev-e0320",
  storageBucket: "delivery-dev-e0320.firebasestorage.app",
  messagingSenderId: "927514728302",
  appId: "1:927514728302:web:68efa568ec51618ef9137f",
  measurementId: "G-HZX23DVZWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);