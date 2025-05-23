import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { authenticateUser, isAdmin } from "@/middleware/auth"

// Get all users (admin only)
export async function GET(req) {
  try {
    await dbConnect()

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    // Check if user is admin
    if (!isAdmin(authResult.user)) {
      return NextResponse.json({ success: false, message: "Not authorized as an admin" }, { status: 403 })
    }

    // Get pagination parameters
    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page")) || 1
    const limit = Number.parseInt(url.searchParams.get("limit")) || 10
    const skip = (page - 1) * limit

    // Get users
    const users = await User.find({}).select("-password").skip(skip).limit(limit)

    const total = await User.countDocuments()

    return NextResponse.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      users,
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}

// Create a new user (admin only)
export async function POST(req) {
  try {
    await dbConnect()

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    // Check if user is admin
    if (!isAdmin(authResult.user)) {
      return NextResponse.json({ success: false, message: "Not authorized as an admin" }, { status: 403 })
    }

    const { email, password, role } = await req.json()

    // Check if user already exists
    const userExists = await User.findOne({ email })

    if (userExists) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 })
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: role || "user",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
