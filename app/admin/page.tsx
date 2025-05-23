"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { AdminMap } from "@/components/admin-map"
import { DriversTable } from "@/components/drivers-table"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface DriverLocation {
  id: string
  userId: string
  userEmail: string | null
  latitude: number
  longitude: number
  timestamp: Date
}

export default function AdminPage() {
  const [drivers, setDrivers] = useState<DriverLocation[]>([])
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Subscribe to location updates
    const locationsRef = collection(db, "locations")
    const unsubscribe = onSnapshot(
      query(locationsRef),
      (snapshot) => {
        const locations: DriverLocation[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          locations.push({
            id: doc.id,
            userId: data.userId,
            userEmail: data.userEmail,
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: data.timestamp.toDate(),
          })
        })
        setDrivers(locations)
      },
      (error) => {
        console.error("Error fetching locations:", error)
      }
    )

    return () => unsubscribe()
  }, [user, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (!user) {
    return null
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Tracking Dashboard</h1>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md h-[600px] overflow-hidden">
          <AdminMap drivers={drivers} />
        </div>

        {/* Drivers Table Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <DriversTable drivers={drivers} />
        </div>
      </div>
    </div>
  )
} 