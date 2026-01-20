import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBV4xse1xAQk9sErysIjG4QP2HYaez-zaM",
  authDomain: "interviewbuddy-33025.firebaseapp.com",
  projectId: "interviewbuddy-33025",
  storageBucket: "interviewbuddy-33025.appspot.com",
  messagingSenderId: "652918871254",
  appId: "1:652918871254:web:ffdcff115bd4b45250e577",
  measurementId: "G-H5EV3PEW0F"
}
const app = getApps.length > 0 ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
