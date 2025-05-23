"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (adminOnly && !isAdmin()) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, adminOnly, router, isAdmin])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex">
          <p className="text-center text-2xl">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (adminOnly && !isAdmin()) {
    return null
  }

  return children
}
