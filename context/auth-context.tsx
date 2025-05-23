"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import { deleteLocationFromDatabase } from "@/lib/firebase/database"

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", user.uid))
        setIsAdmin(userDoc.data()?.role === "admin")
      } else {
        setIsAdmin(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
    setIsAdmin(userDoc.data()?.role === "admin")
  }

  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Create user document with default role
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      role: "user",
      createdAt: new Date(),
    })
    setIsAdmin(false)
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
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

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
