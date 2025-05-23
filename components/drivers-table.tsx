"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface DriverLocation {
  id: string
  userId: string
  userEmail: string | null
  latitude: number
  longitude: number
  timestamp: Date
}

interface DriversTableProps {
  drivers: DriverLocation[]
}

export function DriversTable({ drivers }: DriversTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter((driver) =>
    driver.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group locations by driver (get latest location for each driver)
  const latestDriverLocations = filteredDrivers.reduce((acc, location) => {
    const existing = acc.get(location.userId)
    if (!existing || existing.timestamp < location.timestamp) {
      acc.set(location.userId, location)
    }
    return acc
  }, new Map<string, DriverLocation>())

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search drivers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver</TableHead>
            <TableHead>Last Location</TableHead>
            <TableHead>Last Update</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from(latestDriverLocations.values()).map((driver) => {
            const lastUpdateTime = new Date(driver.timestamp).getTime()
            const now = new Date().getTime()
            const minutesSinceUpdate = Math.floor((now - lastUpdateTime) / 60000)
            const isActive = minutesSinceUpdate < 5

            return (
              <TableRow key={driver.userId}>
                <TableCell className="font-medium">
                  {driver.userEmail}
                </TableCell>
                <TableCell>
                  {driver.latitude.toFixed(6)}, {driver.longitude.toFixed(6)}
                </TableCell>
                <TableCell>
                  {minutesSinceUpdate < 1
                    ? "Just now"
                    : `${minutesSinceUpdate} minutes ago`}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {Array.from(latestDriverLocations.values()).length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No drivers found
        </div>
      )}
    </div>
  )
} 