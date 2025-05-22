import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="space-y-4 text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-gray-600 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
      </div>
      <Link href="/" className="mt-8">
        <Button>Return Home</Button>
      </Link>
    </div>
  )
}
