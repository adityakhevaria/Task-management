import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Task from "@/models/Task"
import { authenticateUser, isAdmin } from "@/middleware/auth"

// Get task by ID
export async function GET(req, { params }) {
  try {
    await dbConnect()

    const { id } = params

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    const task = await Task.findById(id).populate("assignedTo", "email role").populate("createdBy", "email")

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    // Check if user is admin, creator, or assignee
    const isAssignee = task.assignedTo.some((assignee) => assignee._id.toString() === authResult.user._id.toString())
    if (!isAdmin(authResult.user) && task.createdBy._id.toString() !== authResult.user._id.toString() && !isAssignee) {
      return NextResponse.json({ success: false, message: "Not authorized to access this task" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      task,
    })
  } catch (error) {
    console.error("Get task error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}

// Update task
export async function PUT(req, { params }) {
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

    const { title, description, status, priority, dueDate, assignedTo } = await req.json()

    // Validate assignedTo is an array
    if (assignedTo && (!Array.isArray(assignedTo) || assignedTo.length === 0)) {
      return NextResponse.json(
        { success: false, message: "Please assign this task to at least one user" },
        { status: 400 },
      )
    }

    // Update task
    if (title) task.title = title
    if (description) task.description = description
    if (status) task.status = status
    if (priority) task.priority = priority
    if (dueDate) task.dueDate = dueDate
    if (assignedTo) task.assignedTo = assignedTo

    await task.save()

    // Populate the task with user details
    await task.populate("assignedTo", "email role")
    await task.populate("createdBy", "email")

    return NextResponse.json({
      success: true,
      task,
    })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}

// Delete task
export async function DELETE(req, { params }) {
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
      return NextResponse.json({ success: false, message: "Not authorized to delete this task" }, { status: 403 })
    }

    await Task.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Task removed",
    })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
