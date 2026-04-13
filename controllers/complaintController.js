import  Complaint  from "../models/complaints.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// CREATE COMPLAINT (Student)
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, hostelBlock, roomNumber, priority } =
    req.body;

  if (!title || !category || !hostelBlock || !roomNumber) {
    throw new ApiError(
      400,
      "Title, category, hostelBlock and roomNumber are required"
    );
  }

  // Handle image uploads if any
  let images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded) {
        images.push({
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
        });
      }
    }
  }

  const complaint = await Complaint.create({
    student: req.user._id,
    title,
    description,
    category,
    hostelBlock,
    roomNumber,
    priority: priority || "medium",
    images,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, complaint, "Complaint created successfully"));
});

// GET ALL COMPLAINTS (Admin)
export const getAllComplaints = asyncHandler(async (req, res) => {
  const { status, priority, category, hostelBlock } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (hostelBlock) filter.hostelBlock = hostelBlock;

  const complaints = await Complaint.find(filter)
    .populate("student", "fullName email roomNumber hostelBlock")
    .populate("assignedTo", "fullName email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, complaints, "All complaints fetched"));
});

// GET MY COMPLAINTS (Student)
export const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ student: req.user._id })
    .populate("assignedTo", "fullName email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, complaints, "Your complaints fetched"));
});

// GET SINGLE COMPLAINT
export const getComplaintById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findById(id)
    .populate("student", "fullName email roomNumber hostelBlock")
    .populate("assignedTo", "fullName email");

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, complaint, "Complaint fetched"));
});

// UPDATE COMPLAINT STATUS (Admin/Staff)
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  complaint.status = status;

  if (status === "resolved") {
    complaint.resolvedAt = new Date();
  }

  if (status === "escalated") {
    complaint.isEscalated = true;
    complaint.escalatedAt = new Date();
  }

  await complaint.save();

  return res
    .status(200)
    .json(new ApiResponse(200, complaint, "Complaint status updated"));
});

// ASSIGN COMPLAINT TO STAFF (Admin)
export const assignComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { staffId } = req.body;

  if (!staffId) {
    throw new ApiError(400, "Staff ID is required");
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  complaint.assignedTo = staffId;
  complaint.assignedAt = new Date();
  complaint.status = "assigned";

  await complaint.save();

  const updatedComplaint = await Complaint.findById(id)
    .populate("student", "fullName email roomNumber hostelBlock")
    .populate("assignedTo", "fullName email");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComplaint, "Complaint assigned to staff")
    );
});

// DELETE COMPLAINT (Admin or Owner)
export const deleteComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  // Only admin or the student who created it can delete
  if (
    req.user.role !== "admin" &&
    complaint.student.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to delete this complaint");
  }

  await Complaint.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Complaint deleted successfully"));
});

// GET COMPLAINTS ASSIGNED TO STAFF (Staff)
export const getAssignedComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ assignedTo: req.user._id })
    .populate("student", "fullName email roomNumber hostelBlock")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, complaints, "Assigned complaints fetched"));
});

// GET COMPLAINT STATS (Admin Dashboard)
export const getComplaintStats = asyncHandler(async (req, res) => {
  const totalComplaints = await Complaint.countDocuments();
  const pendingComplaints = await Complaint.countDocuments({
    status: "pending",
  });
  const resolvedComplaints = await Complaint.countDocuments({
    status: "resolved",
  });
  const escalatedComplaints = await Complaint.countDocuments({
    isEscalated: true,
  });
  const inProgressComplaints = await Complaint.countDocuments({
    status: "in_progress",
  });

  const categoryWise = await Complaint.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const priorityWise = await Complaint.aggregate([
    { $group: { _id: "$priority", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        escalatedComplaints,
        inProgressComplaints,
        categoryWise,
        priorityWise,
      },
      "Complaint stats fetched"
    )
  );
});