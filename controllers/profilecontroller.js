import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

import roommodel from "../models/roommodel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import fs from "fs";


// update profile
export const updateProfile = async (req, res) => {
  
    const userId = req.user._id; // auth middleware se

     const { fullName, phone, gender, roomNumber, hostelBlock, department } =
    req.body;

     // at least one field hona chahiye
  if (!fullName && !phone && !gender && !roomNumber && !hostelBlock && !department) {
    throw new ApiError(400, "At least one field is required to update");
  }

   // sirf jo fields aaye unhe update karo
  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (phone) updateFields.phone = phone;
  if (gender) updateFields.gender = gender;
  if (roomNumber) updateFields.roomNumber = roomNumber;
  if (hostelBlock) updateFields.hostelBlock = hostelBlock;
  if (department) updateFields.department = department;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
     updateFields,
      { new: true , runValidators: true }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));

 
  };
// get profile
export const getProfile = asyncHandler(async (req, res) => {
  
    const userId = req.user._id;
// yaha password ko hide kiya h 
   const user = await User.findById(userId).select("-password");
   
   if(!user){
    throw new ApiError(404,"user not found");
   }

    return res
    .status(200).
    json(new ApiResponse(200,user,"profile fetched successfully"));

  });
    
// uploadprofilepic 
export const uploadProfilePic = async (req, res) => {
    // user id (auth middleware se aayega)
    const userId = req.user._id;

   // multer middleware se file aayegi
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }


    const localFilePath = req.file.path;

    // upload to cloudinary
  let cloudinaryResponse;
  try {
    cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
      folder: "hostel_profile_pics",
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
      ],
    });
  } catch (error) {
    // local file delete karo agar cloudinary fail ho
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new ApiError(500, "Error while uploading image to cloudinary");
  }

  // local temp file delete karo upload ke baad
  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
  }

  // agar user ka purana profile pic hai toh cloudinary se delete karo
  const existingUser = await User.findById(userId);

  if (existingUser?.profilePic?.publicId) {
    await cloudinary.uploader.destroy(existingUser.profilePic.publicId);
  }

  // user update karo with new image url & publicId
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      profilePic: {
        url: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Profile picture uploaded successfully")
    );
};

// DELETE PROFILE PICTURE
export const deleteProfilePic = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.profilePic?.publicId) {
    throw new ApiError(400, "No profile picture to delete");
  }

  // cloudinary se delete karo
  await cloudinary.uploader.destroy(user.profilePic.publicId);

  // user se profilePic hata do
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $unset: { profilePic: 1 } },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Profile picture deleted successfully")
    );
});
// change password
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(
      400,
      "New password cannot be the same as old password"
    );
  }

  // password select karna hai isliye explicitly select kiya
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // old password verify karo
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }

  // new password set karo (pre save hook hash kar dega)
  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});