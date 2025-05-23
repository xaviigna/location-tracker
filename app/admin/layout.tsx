"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Providers } from "@/components/providers"
import { toast } from "@/components/ui/use-toast"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
      })
      router.push("/dashboard")
    }
  }, [user, isAdmin, router])

  if (!user || !isAdmin) {
    return null
  }

  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </Providers>
  )
} 