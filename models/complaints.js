import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
   
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
     
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "electrical",
        "plumbing",
        "cleaning",
        "carpentry",
        "internet",
        "furniture",
        "pest_control",
        "other",
      ],
    },
    
    hostelBlock: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    // Image proof (uploaded to cloudinary)
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    // Smart Priority (auto-detected by system)
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    // Status tracking
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "resolved", "closed", "escalated"],
      default: "pending",
    },
    // Which staff is assigned
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Timestamps for tracking
    assignedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    
    
   
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ student: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;