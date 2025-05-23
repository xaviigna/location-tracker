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
const Map = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
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
  // Calculate center based on all drivers or default to a central location
  const center = drivers.length > 0
    ? [
        drivers.reduce((sum, d) => sum + d.latitude, 0) / drivers.length,
        drivers.reduce((sum, d) => sum + d.longitude, 0) / drivers.length,
      ] as [number, number]
    : [0, 0] as [number, number]

  return (
    <Map
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {drivers.map((driver) => (
        <Marker
          key={driver.id}
          position={[driver.latitude, driver.longitude]}
        >
          <Popup>
            <div>
              <p className="font-semibold">{driver.userEmail}</p>
              <p className="text-sm text-gray-600">
                Last update: {driver.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </Map>
  )
} 