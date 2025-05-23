// This script creates an initial admin user
// Run with: node scripts/create-admin.js

import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env.local")
  process.exit(1)
}

// Define User schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Create User model
const User = mongoose.models.User || mongoose.model("User", UserSchema)

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Check if admin user already exists
    const adminExists = await User.findOne({ email: "admin@example.com" })

    if (adminExists) {
      console.log("Admin user already exists")
      await mongoose.disconnect()
      return
    }

    // Create admin user
    const admin = await User.create({
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    })

    console.log("Admin user created successfully:", admin.email)

    // Create a regular user
    const user = await User.create({
      email: "user@example.com",
      password: "user123",
      role: "user",
    })

    console.log("Regular user created successfully:", user.email)

    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

createAdminUser()
