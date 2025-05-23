"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
  UserCredential
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import { deleteLocationFromDatabase } from "@/lib/firebase/database"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<UserCredential>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => { throw new Error("Not implemented") },
  register: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Create user document with default role
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      role: "user",
      createdAt: new Date(),
    })
  }

  const logout = async () => {
    if (user) {
      try {
        await deleteLocationFromDatabase(user.uid)
      } catch (error) {
        console.error("Error deleting location data:", error)
      }
    }
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export function getAuthErrorMessage(errorCode: string): string {
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
