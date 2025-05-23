"use client"

import { createContext, useState, useContext } from "react"
import { useAuth } from "./AuthContext"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const { token, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  // Get all users (admin only)
  const getUsers = async (page = 1) => {
    try {
      if (!isAdmin()) {
        setError("Not authorized")
        return
      }

      setLoading(true)
      setError(null)

      const res = await fetch(`/api/users?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (data.success) {
        setUsers(data.users)
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total,
        })
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error("Get users error:", error)
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  // Get user by ID
  const getUserById = async (id) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (data.success) {
        return data.user
      } else {
        setError(data.message)
        return null
      }
    } catch (error) {
      console.error("Get user error:", error)
      setError("Failed to fetch user")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Create user (admin only)
  const createUser = async (userData) => {
    try {
      if (!isAdmin()) {
        return { success: false, message: "Not authorized" }
      }

      setLoading(true)
      setError(null)

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (data.success) {
        return { success: true, user: data.user }
      } else {
        setError(data.message)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error("Create user error:", error)
      setError("Failed to create user")
      return { success: false, message: "Failed to create user" }
    } finally {
      setLoading(false)
    }
  }

  // Update user
  const updateUser = async (id, userData) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (data.success) {
        return { success: true, user: data.user }
      } else {
        setError(data.message)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error("Update user error:", error)
      setError("Failed to update user")
      return { success: false, message: "Failed to update user" }
    } finally {
      setLoading(false)
    }
  }

  // Delete user (admin only)
  const deleteUser = async (id) => {
    try {
      if (!isAdmin()) {
        return { success: false, message: "Not authorized" }
      }

      setLoading(true)
      setError(null)

      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (data.success) {
        return { success: true }
      } else {
        setError(data.message)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error("Delete user error:", error)
      setError("Failed to delete user")
      return { success: false, message: "Failed to delete user" }
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        error,
        pagination,
        getUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
