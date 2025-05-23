"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

interface MapProps {
  center: [number, number]
  zoom?: number
  children?: React.ReactNode
}

export default function Map({ center, zoom = 16, children }: MapProps) {
  useEffect(() => {
    // Load Leaflet CSS
    import("leaflet/dist/leaflet.css")
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  )
} 