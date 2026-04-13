import User from "../models/User.js";
import Complaint  from "../models/complaints.js";
import Feedback from "../models/feedback.js";
import Announcement from "../models/announcement.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET ALL USERS
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, hostelBlock } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (hostelBlock) filter.hostelBlock = hostelBlock;

  const users = await User.find(filter)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

// GET SINGLE USER
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

// UPDATE USER ROLE
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !["student", "admin", "staff"].includes(role)) {
    throw new ApiError(
      400,
      "Valid role is required (student, admin, staff)"
    );
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // apna role change karne se rokna
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot change your own role");
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User role updated successfully")
    );
});

// UPDATE USER PROFILE (Admin)
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, phone, roomNumber, hostelBlock, department } =
    req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  if (roomNumber) user.roomNumber = roomNumber;
  if (hostelBlock) user.hostelBlock = hostelBlock;
  if (department) user.department = department;

  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "User profile updated successfully"
      )
    );
});

// DELETE USER
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // apne aap ko delete karne se rokna
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  await User.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
});

// DASHBOARD STATS (Admin)
export const getDashboardStats = asyncHandler(async (req, res) => {
  // User stats
  const totalStudents = await User.countDocuments({ role: "student" });
  const totalStaff = await User.countDocuments({ role: "staff" });
  const totalAdmins = await User.countDocuments({ role: "admin" });

  // Complaint stats
  const totalComplaints = await Complaint.countDocuments();
  const pendingComplaints = await Complaint.countDocuments({
    status: "pending",
  });
  const resolvedComplaints = await Complaint.countDocuments({
    status: "resolved",
  });
  const inProgressComplaints = await Complaint.countDocuments({
    status: "in_progress",
  });
  const escalatedComplaints = await Complaint.countDocuments({
    isEscalated: true,
  });

  // Complaint category wise
  const categoryWise = await Complaint.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Block wise complaints
  const blockWise = await Complaint.aggregate([
    { $group: { _id: "$hostelBlock", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Feedback stats
  const totalFeedbacks = await Feedback.countDocuments();
  const avgRating = await Feedback.aggregate([
    { $group: { _id: null, avg: { $avg: "$rating" } } },
  ]);

  // Announcement stats
  const totalAnnouncements = await Announcement.countDocuments({
    isActive: true,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: {
          totalStudents,
          totalStaff,
          totalAdmins,
        },
        complaints: {
          totalComplaints,
          pendingComplaints,
          resolvedComplaints,
          inProgressComplaints,
          escalatedComplaints,
          categoryWise,
          blockWise,
        },
        feedbacks: {
          totalFeedbacks,
          averageRating: avgRating[0]?.avg?.toFixed(1) || 0,
        },
        announcements: {
          totalActiveAnnouncements: totalAnnouncements,
        },
      },
      "Dashboard stats fetched successfully"
    )
  );
});