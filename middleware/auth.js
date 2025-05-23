import jwt from "jsonwebtoken"
import User from "../models/User"

export async function authenticateUser(req) {
  try {
    // Get token from header
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, message: "No token, authorization denied" }
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from the token
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return { success: false, message: "User not found" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return { success: false, message: "Not authorized, token failed" }
  }
}

export function isAdmin(user) {
  return user.role === "admin"
}
