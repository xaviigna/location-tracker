"use client"

import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Location Tracker</h1>
        <p className="text-lg text-gray-600 max-w-md">
          Track your location in real-time with our easy-to-use platform.
        </p>
        <div className="space-x-4">
          {user ? (
            <>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
