"use client"

import { useLocationTracking } from "@/hooks/useLocationTracking"

export default function DashboardPage() {
  const location = useLocationTracking()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Location Tracking</h1>
      
      {location.error ? (
        <div className="text-red-500">Error: {location.error}</div>
      ) : location.latitude && location.longitude ? (
        <div className="space-y-2">
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
          <p className="text-sm text-gray-500">Location is being saved every 5 seconds</p>
        </div>
      ) : (
        <div>Getting location...</div>
      )}
    </div>
  )
}
