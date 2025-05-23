import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import jwt from "jsonwebtoken"

export async function POST(req) {
  try {
    await dbConnect()

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
      role: role || "user", // Default to 'user' if not specified
    })

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
