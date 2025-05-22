import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALFDQiI4UdH2wLX5z4Sjy8LnoQr-dUq38",
  authDomain: "drivers-app-c24ea.firebaseapp.com",
  projectId: "drivers-app-c24ea",
  storageBucket: "drivers-app-c24ea.firebasestorage.app",
  messagingSenderId: "796558773394",
  appId: "1:796558773394:web:99db150778ea0ac7d4aa4b"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db } 