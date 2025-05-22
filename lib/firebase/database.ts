import { ref, set, remove } from "firebase/database"
import { database } from "./config"

interface LocationData {
  lat: number
  lng: number
}

export async function saveLocationToDatabase(userId: string, locationData: LocationData): Promise<void> {
  const locationRef = ref(database, `drivers/${userId}`)
  await set(locationRef, locationData)
}

export async function deleteLocationFromDatabase(userId: string): Promise<void> {
  const locationRef = ref(database, `drivers/${userId}`)
  await remove(locationRef)
}
