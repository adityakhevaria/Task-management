import { NextResponse } from "next/server"
import { readFile, unlink } from "fs/promises"
import path from "path"
import dbConnect from "@/lib/dbConnect"
import Task from "@/models/Task"
import { authenticateUser, isAdmin } from "@/middleware/auth"

// Get document
export async function GET(req, { params }) {
  try {
    await dbConnect()

    const { id, documentId } = params

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    const task = await Task.findById(id)

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    // Check if user is admin, creator, or assignee
    if (
      !isAdmin(authResult.user) &&
      task.createdBy.toString() !== authResult.user._id.toString() &&
      task.assignedTo.toString() !== authResult.user._id.toString()
    ) {
      return NextResponse.json({ success: false, message: "Not authorized to access this task" }, { status: 403 })
    }

    // Find document
    const document = task.documents.id(documentId)

    if (!document) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 })
    }

    // Read file
    const filePath = path.join(process.cwd(), document.path)
    const fileBuffer = await readFile(filePath)

    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer)
    response.headers.set("Content-Type", document.mimetype)
    response.headers.set("Content-Disposition", `inline; filename="${document.filename}"`)

    return response
  } catch (error) {
    console.error("Get document error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}

// Delete document
export async function DELETE(req, { params }) {
  try {
    await dbConnect()

    const { id, documentId } = params

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

    // Find document
    const document = task.documents.id(documentId)

    if (!document) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 })
    }

    // Delete file
    const filePath = path.join(process.cwd(), document.path)
    await unlink(filePath)

    // Remove document from task
    task.documents.pull(documentId)
    await task.save()

    return NextResponse.json({
      success: true,
      message: "Document removed",
    })
  } catch (error) {
    console.error("Delete document error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
