import Room from "../models/Room.js";
import User from "../models/User.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// CREATE ROOM (Admin)
export const createRoom = asyncHandler(async (req, res) => {
  const {
    roomNumber,
    hostelBlock,
    floor,
    capacity,
    roomType,
    amenities,
    rent,
  } = req.body;

  if (!roomNumber || !hostelBlock || !floor) {
    throw new ApiError(400, "Room number, hostel block and floor are required");
  }

  const existingRoom = await Room.findOne({ roomNumber, hostelBlock });
  if (existingRoom) {
    throw new ApiError(409, "Room already exists in this hostel block");
  }

  const room = await Room.create({
    roomNumber,
    hostelBlock,
    floor,
    capacity,
    roomType,
    amenities,
    rent,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, room, "Room created successfully"));
});

// GET ALL ROOMS
export const getAllRooms = asyncHandler(async (req, res) => {
  const { hostelBlock, status, roomType, floor } = req.query;

  const filter = {};
  if (hostelBlock) filter.hostelBlock = hostelBlock;
  if (status) filter.status = status;
  if (roomType) filter.roomType = roomType;
  if (floor) filter.floor = Number(floor);

  const rooms = await Room.find(filter)
    .populate("occupants", "fullName email phone department")
    .sort({ hostelBlock: 1, roomNumber: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, rooms, "Rooms fetched successfully"));
});

// GET SINGLE ROOM
export const getRoomById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const room = await Room.findById(id).populate(
    "occupants",
    "fullName email phone department"
  );

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, room, "Room fetched"));
});

// GET AVAILABLE ROOMS
export const getAvailableRooms = asyncHandler(async (req, res) => {
  const { hostelBlock } = req.query;

  const filter = { status: { $in: ["available", "occupied"] } };
  if (hostelBlock) filter.hostelBlock = hostelBlock;

  const rooms = await Room.find(filter)
    .populate("occupants", "fullName email")
    .sort({ hostelBlock: 1, roomNumber: 1 });

  // Filter rooms that still have space
  const availableRooms = rooms.filter(
    (room) => room.occupants.length < room.capacity
  );

  return res
    .status(200)
    .json(new ApiResponse(200, availableRooms, "Available rooms fetched"));
});

// ASSIGN STUDENT TO ROOM (Admin)
export const assignStudentToRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    throw new ApiError(400, "Student ID is required");
  }

  const room = await Room.findById(id);
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.occupants.length >= room.capacity) {
    throw new ApiError(400, "Room is already full");
  }

  // Check if student is already in this room
  if (room.occupants.includes(studentId)) {
    throw new ApiError(400, "Student is already assigned to this room");
  }

  // Check if student exists
  const student = await User.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  room.occupants.push(studentId);
  await room.save();

  // Update user record
  student.roomNumber = room.roomNumber;
  student.hostelBlock = room.hostelBlock;
  await student.save({ validateBeforeSave: false });

  const updatedRoom = await Room.findById(id).populate(
    "occupants",
    "fullName email phone department"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRoom, "Student assigned to room"));
});

// REMOVE STUDENT FROM ROOM (Admin)
export const removeStudentFromRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    throw new ApiError(400, "Student ID is required");
  }

  const room = await Room.findById(id);
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (!room.occupants.includes(studentId)) {
    throw new ApiError(400, "Student is not in this room");
  }

  room.occupants = room.occupants.filter(
    (occupant) => occupant.toString() !== studentId
  );
  await room.save();

  // Clear user room info
  await User.findByIdAndUpdate(studentId, {
    $unset: { roomNumber: 1, hostelBlock: 1 },
  });

  const updatedRoom = await Room.findById(id).populate(
    "occupants",
    "fullName email phone department"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRoom, "Student removed from room"));
});

// UPDATE ROOM (Admin)
export const updateRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const room = await Room.findById(id);
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const updatedRoom = await Room.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("occupants", "fullName email phone department");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRoom, "Room updated successfully"));
});

// DELETE ROOM (Admin)
export const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const room = await Room.findById(id);
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.occupants.length > 0) {
    throw new ApiError(
      400,
      "Cannot delete room with occupants. Remove all students first."
    );
  }

  await Room.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Room deleted successfully"));
});

// ROOM STATS (Admin Dashboard)
export const getRoomStats = asyncHandler(async (req, res) => {
  const totalRooms = await Room.countDocuments();
  const availableRooms = await Room.countDocuments({ status: "available" });
  const occupiedRooms = await Room.countDocuments({ status: "occupied" });
  const fullRooms = await Room.countDocuments({ status: "full" });
  const maintenanceRooms = await Room.countDocuments({
    status: "maintenance",
  });

  const blockWise = await Room.aggregate([
    {
      $group: {
        _id: "$hostelBlock",
        totalRooms: { $sum: 1 },
        totalCapacity: { $sum: "$capacity" },
        totalOccupants: { $sum: { $size: "$occupants" } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalRooms,
        availableRooms,
        occupiedRooms,
        fullRooms,
        maintenanceRooms,
        blockWise,
      },
      "Room stats fetched"
    )
  );
});