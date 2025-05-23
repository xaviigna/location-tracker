"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  })
}

// Component to handle auto-centering
function AutoCenter({ position }: { position: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [map, position])

  return null
}

interface MapComponentProps {
  position: [number, number]
}

export default function MapComponent({ position }: MapComponentProps) {
  return (
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
  )
} 