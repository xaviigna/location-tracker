const { initializeApp } = require('firebase/app')
const { getFirestore, doc, updateDoc } = require('firebase/firestore')

// Your Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function makeAdmin(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      role: 'admin'
    })
    console.log(`Successfully made user ${userId} an admin`)
  } catch (error) {
    console.error('Error making user admin:', error)
  }
}

// Get userId from command line argument
const userId = process.argv[2]
if (!userId) {
  console.error('Please provide a user ID')
  process.exit(1)
}

makeAdmin(userId) 