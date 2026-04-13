const User = require("../models/User");
const cloudinary = require("cloudinary").v2;



// update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // auth middleware se

    const { name, contactNumber, gender, hostelRoom } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        contactNumber,
        gender,
        hostelRoom,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// get profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
// yaha password ko hide kiya h 
   const user = await User.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// uploadprofilepic 
exports.uploadProfilePic = async (req, res) => {
  try {
    // user id (auth middleware se aayega)
    const userId = req.user.id;

    // file check
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = req.files.image;

    // optional: file type validation
    const supportedTypes = ["jpg", "jpeg", "png"];
    // isme kuch improvement ho skta h  kyuki iski vajah se error aa skte h
    const fileType = file.name.split(".")[1].toLowerCase();

    if (!supportedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "File format not supported",
      });
    }

    // upload to cloudinary
    const response = await cloudinary.uploader.upload(
      file.tempFilePath,
      {
        folder: "profile_pics",
      }
    );

    // update user with image url
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: response.secure_url },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: updatedUser,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while uploading profile picture",
      error: error.message,
    });
  }
};