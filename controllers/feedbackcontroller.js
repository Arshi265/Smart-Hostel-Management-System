import Feedback from "../models/feedback.js";


//  CREATE FEEDBACK
export const createFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;

    const feedback = await Feedback.create({
      userId: req.user.id,   // coming from JWT middleware
      message,
      rating
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//  GET ALL FEEDBACK (ADMIN VIEW)
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "name email") // show user details
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: feedbacks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//  DELETE FEEDBACK (optional)
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    await Feedback.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};