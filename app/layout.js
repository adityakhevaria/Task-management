import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import { TaskProvider } from "@/context/TaskContext"
import { UserProvider } from "@/context/UserContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Task Management System",
  description: "A full-stack task management system",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <UserProvider>
            <TaskProvider>{children}</TaskProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
