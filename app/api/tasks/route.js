import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Task from "@/models/Task"
import { authenticateUser, isAdmin } from "@/middleware/auth"

// Get all tasks
export async function GET(req) {
  try {
    await dbConnect()

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page")) || 1
    const limit = Number.parseInt(url.searchParams.get("limit")) || 10
    const status = url.searchParams.get("status")
    const priority = url.searchParams.get("priority")
    const dueDate = url.searchParams.get("dueDate")
    const search = url.searchParams.get("search")
    const category = url.searchParams.get("category")
    const sortBy = url.searchParams.get("sortBy") || "createdAt"
    const sortOrder = url.searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build query
    const query = {}

    // If not admin, only show tasks assigned to or created by the user
    if (!isAdmin(authResult.user)) {
      query.$or = [{ assignedTo: authResult.user._id }, { createdBy: authResult.user._id }]
    }

    // Add filters
    if (status) query.status = status
    if (priority) query.priority = priority
    if (category) query.category = new RegExp(category, "i")
    if (search) {
      query.$and = query.$and || []
      query.$and.push({
        $or: [
          { title: new RegExp(search, "i") },
          { description: new RegExp(search, "i") },
          { category: new RegExp(search, "i") },
          { tags: { $in: [new RegExp(search, "i")] } },
        ],
      })
    }
    if (dueDate) {
      const date = new Date(dueDate)
      query.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      }
    }

    // Build sort
    const sort = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Get tasks
    const tasks = await Task.find(query)
      .populate("assignedTo", "email role")
      .populate("createdBy", "email")
      .populate("comments.user", "email")
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Task.countDocuments(query)

    return NextResponse.json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      tasks,
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}

// Create a new task
export async function POST(req) {
  try {
    await dbConnect()

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    const { title, description, status, priority, dueDate, assignedTo, category, tags, estimatedHours } =
      await req.json()

    // Validate assignedTo is an array
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please assign this task to at least one user" },
        { status: 400 },
      )
    }

    // Process tags
    const processedTags = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : []

    // Create task
    const task = await Task.create({
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      dueDate,
      assignedTo,
      createdBy: authResult.user._id,
      category: category || "",
      tags: processedTags,
      estimatedHours: estimatedHours || 0,
      documents: [],
      comments: [],
    })

    // Populate the task with user details
    await task.populate("assignedTo", "email role")
    await task.populate("createdBy", "email")

    return NextResponse.json({
      success: true,
      task,
    })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
