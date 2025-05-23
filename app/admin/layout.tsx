"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Providers } from "@/components/providers"
import { toast } from "@/components/ui/use-toast"
import { isUserAdmin } from "@/lib/firebase/admin"
import { LoadingSpinner } from "@/components/loading-spinner"
import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    async function checkAccess() {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const isAdmin = await isUserAdmin(user.uid)
        if (!isAdmin) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You don't have permission to access the admin panel.",
          })
          router.push("/dashboard")
          return
        }
        setHasAccess(true)
      } catch (error) {
        console.error("Error checking admin access:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem verifying your access. Please try again.",
        })
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [user, router])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem logging out. Please try again.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
              <a className="mr-6 flex items-center space-x-2" href="/admin">
                <span className="hidden font-bold sm:inline-block">
                  Admin Panel
                </span>
              </a>
              <AdminNav />
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="container py-6">
          {children}
        </main>
      </div>
    </Providers>
  )
} 