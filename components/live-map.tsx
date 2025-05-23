"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useAuth } from "@/context/auth-context"
import { saveLocationToDatabase } from "@/lib/firebase/database"
import { useToast } from "@/components/ui/use-toast"

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Component to handle auto-centering
function AutoCenter({ position }: { position: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [map, position])

  return null
}

export function LiveMap() {
  const [position, setPosition] = useState<[number, number]>([0, 0])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Error",
        description: "Geolocation is not supported by your browser"
      })
      return
    }

    // Watch position
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newPosition: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ]
        setPosition(newPosition)
        setIsLoading(false)

        // Save location to Firestore
        if (user) {
          try {
            await saveLocationToDatabase(
              user.uid,
              user.email,
              newPosition[0],
              newPosition[1]
            )
          } catch (error) {
            console.error("Error saving location:", error)
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to save location data"
            })
          }
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        setIsLoading(false)
        toast({
          variant: "destructive",
          title: "Location Error",
          description: error.message || "Failed to get location"
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )

    // Cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [user, toast])

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-full">
      <MapContainer
        center={position}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Your current location</Popup>
        </Marker>
        <AutoCenter position={position} />
      </MapContainer>
    </div>
  )
} 