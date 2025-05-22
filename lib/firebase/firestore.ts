import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { app } from "./config"
import type { User } from "firebase/auth"

const db = getFirestore(app)

export interface LocationData {
  latitude: number
  longitude: number
  timestamp: any // FirebaseFirestore.FieldValue
  userId: string
  userEmail: string | null
}

export async function saveLocation(lat: number, lng: number, user: User) {
  if (!user) {
    throw new Error("User must be authenticated to save location")
  }

  const locationData: LocationData = {
    latitude: lat,
    longitude: lng,
    timestamp: serverTimestamp(),
    userId: user.uid,
    userEmail: user.email,
  }

  try {
    await addDoc(collection(db, "locations"), locationData)
  } catch (error) {
    console.error("Error saving location:", error)
    throw error
  }
} 