"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

interface DriverLocation {
  id: string
  userId: string
  userEmail: string | null
  latitude: number
  longitude: number
  timestamp: Date
}

interface AdminMapProps {
  drivers: DriverLocation[]
}

// Fix for default marker icons in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  })
}

// Dynamically import the map component with no SSR
const MapComponent = dynamic(
  () => import("./map-with-drivers").then((mod) => mod.MapWithDrivers),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    ),
  }
)

export function AdminMap({ drivers }: AdminMapProps) {
  return <MapComponent drivers={drivers} />
} 