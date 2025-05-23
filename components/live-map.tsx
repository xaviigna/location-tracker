"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import type { MapContainer as MapContainerType, TileLayer as TileLayerType, Marker as MarkerType, Popup as PopupType } from "react-leaflet"
import { useMap } from "react-leaflet"
import { saveLocationToDatabase } from "@/lib/firebase/database"

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer) as Promise<typeof MapContainerType>,
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer) as Promise<typeof TileLayerType>,
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker) as Promise<typeof MarkerType>,
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup) as Promise<typeof PopupType>,
  { ssr: false }
)

// Dynamically import the map component with no SSR
const MapComponent = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center">
      <p>Loading map...</p>
    </div>
  ),
})

// Component to handle auto-centering
const AutoCenter = dynamic(
  () =>
    Promise.resolve(({ position }: { position: [number, number] }) => {
      const map = useMap()
      useEffect(() => {
        map.setView(position, map.getZoom())
      }, [map, position])
      return null
    }),
  { ssr: false }
)

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
      <MapComponent position={position} />
    </div>
  )
} 