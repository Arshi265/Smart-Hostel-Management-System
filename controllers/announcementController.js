import Announcement from "../models/announcement.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// CREATE ANNOUNCEMENT (Admin only)
export const createAnnouncement = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    targetAudience,
    hostelBlock,
    priority,
    expiresAt,
  } = req.body;

  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }

  const announcement = await Announcement.create({
    title,
    content,
    postedBy: req.user._id,
    targetAudience,
    hostelBlock,
    priority,
    expiresAt,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        announcement,
        "Announcement created successfully"
      )
    );
});

// GET ALL ANNOUNCEMENTS (Everyone)
export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const { targetAudience, priority, hostelBlock } = req.query;

  const filter = { isActive: true };

  if (targetAudience) filter.targetAudience = targetAudience;
  if (priority) filter.priority = priority;
  if (hostelBlock) {
    filter.$or = [
      { hostelBlock: hostelBlock },
      { hostelBlock: null },
    ];
  }

  // expired announcements filter out karo
  filter.$and = [
    {
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    },
  ];

  const announcements = await Announcement.find(filter)
    .populate("postedBy", "fullName email role")
    .sort({ priority: -1, createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, announcements, "Announcements fetched successfully")
    );
});

// GET SINGLE ANNOUNCEMENT (Everyone)
export const getAnnouncementById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = await Announcement.findById(id).populate(
    "postedBy",
    "fullName email role"
  );

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, announcement, "Announcement fetched successfully")
    );
});

// UPDATE ANNOUNCEMENT (Admin only)
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = await Announcement.findById(id);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).populate("postedBy", "fullName email role");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedAnnouncement,
        "Announcement updated successfully"
      )
    );
});

// DELETE ANNOUNCEMENT (Admin only)
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = await Announcement.findById(id);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  await Announcement.findByIdAndDelete(id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Announcement deleted successfully")
    );
});

// TOGGLE ACTIVE STATUS (Admin only)
export const toggleAnnouncementStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = await Announcement.findById(id);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  announcement.isActive = !announcement.isActive;
  await announcement.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        announcement,
        `Announcement ${
          announcement.isActive ? "activated" : "deactivated"
        } successfully`
      )
    );
});