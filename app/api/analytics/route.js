import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Task from "@/models/Task"
import { authenticateUser, isAdmin } from "@/middleware/auth"

export async function GET(req) {
  try {
    await dbConnect()

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    // Build query based on user role
    const query = {}
    if (!isAdmin(authResult.user)) {
      query.$or = [{ assignedTo: authResult.user._id }, { createdBy: authResult.user._id }]
    }

    // Get total tasks
    const totalTasks = await Task.countDocuments(query)

    // Get completed tasks
    const completedTasks = await Task.countDocuments({ ...query, status: "completed" })

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      ...query,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    })

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Get status distribution
    const statusDistribution = await Task.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])

    const statusStats = {
      pending: 0,
      inProgress: 0,
      completed: 0,
    }

    statusDistribution.forEach((item) => {
      if (item._id === "pending") statusStats.pending = item.count
      if (item._id === "in-progress") statusStats.inProgress = item.count
      if (item._id === "completed") statusStats.completed = item.count
    })

    // Get priority distribution
    const priorityDistribution = await Task.aggregate([
      { $match: query },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ])

    const priorityStats = {
      low: 0,
      medium: 0,
      high: 0,
    }

    priorityDistribution.forEach((item) => {
      if (item._id === "low") priorityStats.low = item.count
      if (item._id === "medium") priorityStats.medium = item.count
      if (item._id === "high") priorityStats.high = item.count
    })

    // Get top categories
    const topCategories = await Task.aggregate([
      { $match: { ...query, category: { $ne: "" } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    const analytics = {
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate,
      statusDistribution: statusStats,
      priorityDistribution: priorityStats,
      topCategories,
    }

    return NextResponse.json({
      success: true,
      analytics,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
