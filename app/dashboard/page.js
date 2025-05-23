"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useTask } from "@/context/TaskContext"
import Link from "next/link"

export default function Dashboard() {
  const { user } = useAuth()
  const { getTasks, tasks, loading } = useTask()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  })

  useEffect(() => {
    getTasks()
  }, [getTasks])

  useEffect(() => {
    if (tasks.length > 0) {
      const pending = tasks.filter((task) => task.status === "pending").length
      const inProgress = tasks.filter((task) => task.status === "in-progress").length
      const completed = tasks.filter((task) => task.status === "completed").length

      setStats({
        total: tasks.length,
        pending,
        inProgress,
        completed,
      })
    }
  }, [tasks])

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {user?.email}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/tasks/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Task
            </Link>
            <Link
              href="/tasks"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View All Tasks
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
              </dl>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                <dd className="mt-1 text-3xl font-semibold text-yellow-500">{stats.pending}</dd>
              </dl>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-500">{stats.inProgress}</dd>
              </dl>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Completed Tasks</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-500">{stats.completed}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Tasks</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {loading ? (
              <li className="px-4 py-4 sm:px-6 flex justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="ml-2">Loading tasks...</span>
              </li>
            ) : tasks.length === 0 ? (
              <li className="px-4 py-4 sm:px-6">
                <p>No tasks found</p>
                <p className="mt-2 text-sm text-gray-500">
                  Get started by{" "}
                  <Link href="/tasks/new" className="font-medium text-indigo-600 hover:text-indigo-500">
                    creating a new task
                  </Link>
                </p>
              </li>
            ) : (
              tasks.slice(0, 5).map((task) => (
                <li key={task._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <Link href={`/tasks/${task._id}`} className="block">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-indigo-600 truncate">{task.title}</p>
                        <p className="mt-1 text-sm text-gray-500 truncate">{task.description}</p>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          <p className="ml-4">Assigned to: {task.assignedTo.map((user) => user.email).join(", ")}</p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : task.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {task.status}
                        </p>
                        <p
                          className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "medium"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {task.priority}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="px-4 py-4 border-t border-gray-200 sm:px-6">
            <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all tasks
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
