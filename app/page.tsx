import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Location Tracker</h1>
        <p className="text-lg text-gray-600 max-w-md">
          A simple web application to track and record your location in real-time using Firebase.
        </p>
      </div>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <Link href="/login" className="w-full">
          <Button className="w-full" size="lg">
            Login
          </Button>
        </Link>
        <Link href="/register" className="w-full">
          <Button variant="outline" className="w-full" size="lg">
            Register
          </Button>
        </Link>
      </div>
    </div>
  )
}
