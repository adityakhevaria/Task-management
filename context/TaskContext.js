"use client"

import { createContext, useState, useContext } from "react"
import { useAuth } from "./AuthContext"

const TaskContext = createContext()

export const TaskProvider = ({ children }) => {
  const { token } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  // Get all tasks
  const getTasks = async (page = 1, filters = {}, sort = {}) => {
    try {
      setLoading(true)
      setError(null)

      // Build query string
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())

      // Add filters
      if (filters.status) queryParams.append("status", filters.status)
      if (filters.priority) queryParams.append("priority", filters.priority)
      if (filters.dueDate) queryParams.append("dueDate", filters.dueDate)

      // Add sort
      if (sort.sortBy) queryParams.append("sortBy", sort.sortBy)
      if (sort.sortOrder) queryParams.append("sortOrder", sort.sortOrder)

      const res = await fetch(`/api/tasks?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (data.success) {
        setTasks(data.tasks)
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total,
        })
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error("Get tasks error:", error)
      setError("Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  // Get task by ID
  const getTaskById = async (id) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (data.success) {
        return data.task
      } else {
        setError(data.message)
        return null
      }
    } catch (error) {
      console.error("Get task error:", error)
      setError("Failed to fetch task")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Create task
  const createTask = async (taskData) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      })

      const data = await res.json()

      if (data.success) {
        return { success: true, task: data.task }
      } else {
        setError(data.message)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error("Create task error:", error)
      setError("Failed to create task")
      return { success: false, message: "Failed to create task" }
    } finally {
      setLoading(false)
    }
  }

  // Update task
  const updateTask = async (id, taskData) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      })

      const data = await res.json()

      if (data.success) {
        return { success: true, task: data.task }
      } else {
        setError(data.message)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error("Update task error:", error)
      setError("Failed to update task")
      return { success: false, message: "Failed to update task" }
    } finally {
      setLoading(false)
    }
  }

  // Delete task
  const deleteTask = async (id) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/tasks/${id}`, {
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
      console.error("Delete task error:", error)
      setError("Failed to delete task")
      return { success: false, message: "Failed to delete task" }
    } finally {
      setLoading(false)
    }
  }

  // Upload document to task
  const uploadDocument = async (taskId, file) => {
    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`/api/tasks/${taskId}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        return { success: true, document: data.document }
      } else {
        setError(data.message)
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error("Upload document error:", error)
      setError("Failed to upload document")
      return { success: false, message: "Failed to upload document" }
    } finally {
      setLoading(false)
    }
  }

  // Delete document from task
  const deleteDocument = async (taskId, documentId) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/tasks/${taskId}/documents/${documentId}`, {
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
      console.error("Delete document error:", error)
      setError("Failed to delete document")
      return { success: false, message: "Failed to delete document" }
    } finally {
      setLoading(false)
    }
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        pagination,
        getTasks,
        getTaskById,
        createTask,
        updateTask,
        deleteTask,
        uploadDocument,
        deleteDocument,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export const useTask = () => useContext(TaskContext)
