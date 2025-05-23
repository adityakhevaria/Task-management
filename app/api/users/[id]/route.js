import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { authenticateUser, isAdmin } from "@/middleware/auth"

// Get user by ID
export async function GET(req, { params }) {
  try {
    await dbConnect()

    const { id } = params

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    // Check if user is admin or the user themselves
    if (!isAdmin(authResult.user) && authResult.user._id.toString() !== id) {
      return NextResponse.json({ success: false, message: "Not authorized to access this user" }, { status: 403 })
    }

    const user = await User.findById(id).select("-password")

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}

// Update user
export async function PUT(req, { params }) {
  try {
    await dbConnect()

    const { id } = params

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    // Check if user is admin or the user themselves
    if (!isAdmin(authResult.user) && authResult.user._id.toString() !== id) {
      return NextResponse.json({ success: false, message: "Not authorized to update this user" }, { status: 403 })
    }

    const { email, role } = await req.json()

    // Find user
    const user = await User.findById(id)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Update user
    if (email) user.email = email

    // Only admin can update role
    if (role && isAdmin(authResult.user)) {
      user.role = role
    }

    await user.save()

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}

// Delete user
export async function DELETE(req, { params }) {
  try {
    await dbConnect()

    const { id } = params

    // Authenticate user
    const authResult = await authenticateUser(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    // Check if user is admin
    if (!isAdmin(authResult.user)) {
      return NextResponse.json({ success: false, message: "Not authorized as an admin" }, { status: 403 })
    }

    const user = await User.findById(id)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    await user.remove()

    return NextResponse.json({
      success: true,
      message: "User removed",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
