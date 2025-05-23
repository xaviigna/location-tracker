import { db } from './config'
import { doc, getDoc } from 'firebase/firestore'

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    return userDoc.exists() && userDoc.data()?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin(userId: string | null): Promise<void> {
  if (!userId) {
    throw new Error('Authentication required')
  }

  const isAdmin = await isUserAdmin(userId)
  if (!isAdmin) {
    throw new Error('Admin access required')
  }
} 