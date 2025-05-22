"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Play, Square } from "lucide-react"
import { saveLocationToDatabase } from "@/lib/firebase/database"

interface LocationTrackerProps {
  userId: string
}

export function LocationTracker({ userId }: LocationTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Check for geolocation permission on component mount
  useEffect(() => {
    const checkPermission = async () => {
      if (!navigator.geolocation) {
        toast({
          variant: "destructive",
          title: "Geolocation not supported",
          description: "Your browser doesn't support geolocation services.",
        })
        return
      }

      try {
        const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName })
        setPermissionStatus(permission.state)

        permission.addEventListener("change", () => {
          setPermissionStatus(permission.state)
        })
      } catch (error) {
        console.error("Error checking geolocation permission:", error)
      }
    }

    checkPermission()
  }, [toast])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation services.",
      })
      return
    }

    setIsTracking(true)

    // Get location immediately
    updateLocation()

    // Then set interval to update every 5 seconds
    intervalRef.current = setInterval(updateLocation, 5000)

    toast({
      title: "Tracking started",
      description: "Your location is now being tracked.",
    })
  }

  const stopTracking = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsTracking(false)
    toast({
      title: "Tracking stopped",
      description: "Your location is no longer being tracked.",
    })
  }

  const updateLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const locationData = { lat: latitude, lng: longitude }

        setCurrentLocation(locationData)

        try {
          await saveLocationToDatabase(userId, locationData)
        } catch (error) {
          console.error("Error saving location:", error)
          toast({
            variant: "destructive",
            title: "Error saving location",
            description: "There was a problem saving your location data.",
          })
        }
      },
      (error) => {
        console.error("Error getting location:", error)

        let errorMessage = "There was a problem getting your location."
        if (error.code === 1) {
          errorMessage = "Location permission denied. Please enable location services."
          stopTracking()
        } else if (error.code === 2) {
          errorMessage = "Location unavailable. Please try again."
        } else if (error.code === 3) {
          errorMessage = "Location request timed out. Please try again."
        }

        toast({
          variant: "destructive",
          title: "Location error",
          description: errorMessage,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Location Tracking</h3>
          <p className="text-sm text-gray-500">
            {isTracking
              ? "Currently tracking your location every 5 seconds"
              : "Press Start Tracking to begin recording your location"}
          </p>
        </div>

        <div className="flex gap-3">
          {!isTracking ? (
            <Button onClick={startTracking} disabled={permissionStatus === "denied"}>
              <Play className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopTracking}>
              <Square className="h-4 w-4 mr-2" />
              Stop Tracking
            </Button>
          )}
        </div>
      </div>

      {permissionStatus === "denied" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md text-sm">
          Location permission is denied. Please enable location services in your browser settings to use tracking
          features.
        </div>
      )}

      {isTracking && currentLocation && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-2">Current Location</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Latitude:</span>{" "}
                    <span className="font-mono">{currentLocation.lat.toFixed(6)}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Longitude:</span>{" "}
                    <span className="font-mono">{currentLocation.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
