import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import dbConnect from "@/lib/dbConnect"
import Task from "@/models/Task"
import { authenticateUser, isAdmin } from "@/middleware/auth"

// Upload documents to a task
export async function POST(req, { params }) {
  try {
    await dbConnect()

    const { id } = params

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    const task = await Task.findById(id)

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    // Check if user is admin or creator
    if (!isAdmin(authResult.user) && task.createdBy.toString() !== authResult.user._id.toString()) {
      return NextResponse.json({ success: false, message: "Not authorized to update this task" }, { status: 403 })
    }

    // Check if task already has 3 documents
    if (task.documents.length >= 3) {
      return NextResponse.json(
        { success: false, message: "Task already has the maximum number of documents (3)" },
        { status: 400 },
      )
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 })
    }

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json({ success: false, message: "Only PDF files are allowed" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "uploads", id)
    await mkdir(uploadDir, { recursive: true })

    // Create unique filename
    const filename = `${Date.now()}-${file.name}`
    const filepath = path.join(uploadDir, filename)

    // Write file to disk
    await writeFile(filepath, buffer)

    // Add document to task
    task.documents.push({
      filename: file.name,
      path: `/uploads/${id}/${filename}`,
      mimetype: file.type,
      size: file.size,
    })

    await task.save()

    return NextResponse.json({
      success: true,
      document: task.documents[task.documents.length - 1],
    })
  } catch (error) {
    console.error("Upload document error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
