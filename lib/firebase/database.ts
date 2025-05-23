import { collection, addDoc, query, where, getDocs, deleteDoc } from "firebase/firestore"
import { db } from "./config"

interface LocationData {
  latitude: number
  longitude: number
  timestamp: Date
  userId: string
  userEmail: string | null
}

export async function saveLocationToDatabase(
  userId: string, 
  email: string | null,
  latitude: number, 
  longitude: number
): Promise<void> {
  const locationData: LocationData = {
    latitude,
    longitude,
    timestamp: new Date(),
    userId,
    userEmail: email
  }

  await addDoc(collection(db, "locations"), locationData)
}

export async function deleteLocationFromDatabase(userId: string): Promise<void> {
  const locationsRef = collection(db, "locations")
  const q = query(locationsRef, where("userId", "==", userId))
  const querySnapshot = await getDocs(q)
  
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
}
