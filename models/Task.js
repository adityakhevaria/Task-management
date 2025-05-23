import mongoose from "mongoose"

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
    maxlength: [1000, "Description cannot be more than 1000 characters"],
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, "Category cannot be more than 50 characters"],
  },
  tags: [
    {
      type: String,
      trim: true,
      maxlength: [30, "Tag cannot be more than 30 characters"],
    },
  ],
  dueDate: {
    type: Date,
    required: [true, "Please provide a due date"],
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please assign this task to at least one user"],
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide the user who created this task"],
  },
  documents: [
    {
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: {
        type: String,
        required: true,
        maxlength: [500, "Comment cannot be more than 500 characters"],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  completedAt: {
    type: Date,
  },
  estimatedHours: {
    type: Number,
    min: 0,
  },
  actualHours: {
    type: Number,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
TaskSchema.pre("save", function (next) {
  this.updatedAt = Date.now()

  // Set completedAt when status changes to completed
  if (this.status === "completed" && !this.completedAt) {
    this.completedAt = Date.now()
  }

  // Clear completedAt if status changes from completed
  if (this.status !== "completed" && this.completedAt) {
    this.completedAt = undefined
  }

  next()
})

export default mongoose.models.Task || mongoose.model("Task", TaskSchema)
