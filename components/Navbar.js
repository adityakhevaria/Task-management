"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="text-white font-bold text-xl">
                Task Manager
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/dashboard"
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tasks"
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Tasks
                </Link>
                <Link
                  href="/analytics"
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Analytics
                </Link>
                {isAdmin() && (
                  <Link
                    href="/users"
                    className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Users
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="text-white mr-4 text-sm">
                <span className="font-medium">{user?.email}</span>
                <span className="ml-2 px-2 py-1 bg-indigo-500 rounded-full text-xs">{user?.role}</span>
              </div>
              <button
                onClick={logout}
                className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-500 focus:outline-none transition-colors duration-200"
            >
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-indigo-700">
          <Link
            href="/dashboard"
            className="text-white hover:bg-indigo-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/tasks"
            className="text-white hover:bg-indigo-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            Tasks
          </Link>
          <Link
            href="/analytics"
            className="text-white hover:bg-indigo-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            Analytics
          </Link>
          {isAdmin() && (
            <Link
              href="/users"
              className="text-white hover:bg-indigo-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Users
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-indigo-700 bg-indigo-700">
          <div className="flex items-center px-5">
            <div className="text-white">
              <div className="text-base font-medium">{user?.email}</div>
              <div className="text-sm text-indigo-300">{user?.role}</div>
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="text-white hover:bg-indigo-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
