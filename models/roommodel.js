import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },

    hostelBlock: {
      type: String,
      required: [true, "Hostel block is required"],
      trim: true,
    },

    floor: {
      type: Number,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      default: 2,
    },

    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    roomType: {
      type: String,
      enum: ["single", "double", "triple", "dormitory"],
      default: "double",
    },

    status: {
      type: String,
      enum: ["available", "occupied", "full", "maintenance"],
      default: "available",
    },

    amenities: [
      {
        type: String,
        enum: [
          "wifi",
          "ac",
          "attached_bathroom",
          "balcony",
          "cupboard",
          "study_table",
        ],
      },
    ],

    rent: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// update status based on occupants
roomSchema.pre("save", function (next) {
  if (this.occupants.length >= this.capacity) {
    this.status = "full";
  } else if (this.occupants.length > 0) {
    this.status = "occupied";
  } else {
    this.status = "available";
  }
  next();
});

roomSchema.index({ hostelBlock: 1, roomNumber: 1 }, { unique: true });

export default mongoose.model("Room", roomSchema);