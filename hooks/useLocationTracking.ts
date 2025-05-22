import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { saveLocation } from "@/lib/firebase/firestore"

interface LocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
}

export function useLocationTracking(enabled: boolean = true) {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
  })
  const { user } = useAuth()

  useEffect(() => {
    if (!enabled || !user) return

    // Function to handle successful location updates
    const handleLocationUpdate = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords
      
      setLocation({
        latitude,
        longitude,
        error: null,
      })

      try {
        await saveLocation(latitude, longitude, user)
      } catch (error) {
        console.error("Failed to save location:", error)
        setLocation(prev => ({ ...prev, error: "Failed to save location" }))
      }
    }

    // Handle location errors
    const handleLocationError = (error: GeolocationPositionError) => {
      setLocation(prev => ({
        ...prev,
        error: error.message,
      }))
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
      }))
      return
    }

    // Set up periodic location tracking
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        handleLocationUpdate,
        handleLocationError,
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      )
    }, 5000) // Update every 5 seconds

    // Alternative: Use watchPosition for continuous updates
    // const watchId = navigator.geolocation.watchPosition(
    //   handleLocationUpdate,
    //   handleLocationError,
    //   {
    //     enableHighAccuracy: true,
    //     timeout: 5000,
    //     maximumAge: 0,
    //   }
    // )

    // Cleanup function
    return () => {
      clearInterval(intervalId)
      // If using watchPosition:
      // navigator.geolocation.clearWatch(watchId)
    }
  }, [enabled, user])

  return location
} 