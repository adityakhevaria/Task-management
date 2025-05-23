"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTask } from "@/context/TaskContext"
import { useUser } from "@/context/UserContext"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"

export default function NewTask() {
  const { createTask, uploadDocument } = useTask()
  const { getUsers, users } = useUser()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    assignedTo: [],
    category: "",
    tags: "",
  })
  const [files, setFiles] = useState([])

  useEffect(() => {
    getUsers()
  }, [getUsers])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUserSelection = (e) => {
    const options = e.target.options
    const selectedUsers = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedUsers.push(options[i].value)
      }
    }
    setFormData((prev) => ({
      ...prev,
      assignedTo: selectedUsers,
    }))
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length + files.length > 3) {
      setError("You can only upload up to 3 documents per task")
      return
    }

    // Validate file types
    const invalidFiles = selectedFiles.filter((file) => file.type !== "application/pdf")
    if (invalidFiles.length > 0) {
      setError("Only PDF files are allowed")
      return
    }

    setFiles((prev) => [...prev, ...selectedFiles])
    setError("")
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.dueDate || formData.assignedTo.length === 0) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Create task first
      const taskResult = await createTask(formData)

      if (taskResult.success) {
        // Upload documents if any
        if (files.length > 0) {
          for (const file of files) {
            await uploadDocument(taskResult.task._id, file)
          }
        }

        setSuccess("Task created successfully!")
        setTimeout(() => {
          router.push("/tasks")
        }, 2000)
      } else {
        setError(taskResult.message)
      }
    } catch (error) {
      console.error("Create task error:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
            <p className="mt-1 text-sm text-gray-500">Create and assign a new task to team members</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/tasks"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Tasks
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                <p className="font-medium">Success</p>
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white p-6 border border-gray-200 rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Task Title *
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter task title"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Describe the task in detail"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      id="category"
                      name="category"
                      type="text"
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g., Development, Design, Marketing"
                    />
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <input
                      id="tags"
                      name="tags"
                      type="text"
                      value={formData.tags}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Comma-separated tags (e.g., urgent, frontend, bug)"
                    />
                  </div>
                </div>
              </div>

              {/* Task Details */}
              <div className="bg-white p-6 border border-gray-200 rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Task Details</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      id="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                      Assigned To * (Hold Ctrl/Cmd to select multiple)
                    </label>
                    <select
                      id="assignedTo"
                      name="assignedTo"
                      multiple
                      value={formData.assignedTo}
                      onChange={handleUserSelection}
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      size={4}
                    >
                      {users.length === 0 ? (
                        <option disabled value="">
                          No users available. Please create users first.
                        </option>
                      ) : (
                        users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.email} ({user.role})
                          </option>
                        ))
                      )}
                    </select>
                    {users.length === 0 && (
                      <p className="mt-2 text-sm text-red-600">
                        No users available. Please{" "}
                        <Link href="/users/new" className="font-medium text-indigo-600 hover:text-indigo-500">
                          create users
                        </Link>{" "}
                        first.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div className="bg-white p-6 border border-gray-200 rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Documents (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="documents" className="block text-sm font-medium text-gray-700">
                      Upload Documents (PDF only, max 3 files)
                    </label>
                    <input
                      id="documents"
                      name="documents"
                      type="file"
                      multiple
                      accept="application/pdf"
                      onChange={handleFileChange}
                      disabled={files.length >= 3}
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100
                        disabled:opacity-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      You can upload up to 3 PDF documents. These can include requirements, specifications, or reference
                      materials.
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {files.map((file, index) => (
                          <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <svg
                                className="flex-shrink-0 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href="/tasks"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || users.length === 0}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Task...
                    </span>
                  ) : (
                    "Create Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
