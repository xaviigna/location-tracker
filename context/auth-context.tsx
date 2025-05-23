"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type AuthError,
} from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { deleteLocationFromDatabase } from "@/lib/firebase/database"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      const authError = error as AuthError
      throw new Error(getAuthErrorMessage(authError.code))
    }
  }

  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      const authError = error as AuthError
      throw new Error(getAuthErrorMessage(authError.code))
    }
  }

  const logout = async () => {
    if (user) {
      // Delete location data when user logs out
      try {
        await deleteLocationFromDatabase(user.uid)
      } catch (error) {
        console.error("Error deleting location data:", error)
      }
    }
    await signOut(auth)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please try logging in instead."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled. Please contact support."
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters)."
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection."
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later."
    default:
      return "An error occurred during authentication. Please try again."
  }
}
