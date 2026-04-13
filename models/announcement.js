import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      maxlength: 200,
    },

    content: {
      type: String,
      required: [true, "Announcement content is required"],
      trim: true,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetAudience: {
      type: String,
      enum: ["all", "students", "staff"],
      default: "all",
    },

    hostelBlock: {
      type: String,
      default: null,
    },

    priority: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: "normal",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model("Announcement", announcementSchema);