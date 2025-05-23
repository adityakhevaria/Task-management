import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Task from "@/models/Task"
import { authenticateUser, isAdmin } from "@/middleware/auth"

// Add a comment to a task
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

    // Check if user is admin, creator, or assignee
    const isAssignee = task.assignedTo.some((assignee) => assignee.toString() === authResult.user._id.toString())
    if (!isAdmin(authResult.user) && task.createdBy.toString() !== authResult.user._id.toString() && !isAssignee) {
      return NextResponse.json({ success: false, message: "Not authorized to comment on this task" }, { status: 403 })
    }

    const { text } = await req.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Comment text is required" }, { status: 400 })
    }

    // Add comment to task
    task.comments.push({
      user: authResult.user._id,
      text: text.trim(),
      createdAt: new Date(),
    })

    await task.save()

    // Populate the comment with user details
    await task.populate("comments.user", "email")

    const newComment = task.comments[task.comments.length - 1]

    return NextResponse.json({
      success: true,
      comment: newComment,
    })
  } catch (error) {
    console.error("Add comment error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}

// Get comments for a task
export async function GET(req, { params }) {
  try {
    await dbConnect()

    const { id } = params

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    const task = await Task.findById(id).populate("comments.user", "email")

    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 })
    }

    // Check if user is admin, creator, or assignee
    const isAssignee = task.assignedTo.some((assignee) => assignee.toString() === authResult.user._id.toString())
    if (!isAdmin(authResult.user) && task.createdBy.toString() !== authResult.user._id.toString() && !isAssignee) {
      return NextResponse.json(
        { success: false, message: "Not authorized to view comments on this task" },
        { status: 403 },
      )
    }

    return NextResponse.json({
      success: true,
      comments: task.comments,
    })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
