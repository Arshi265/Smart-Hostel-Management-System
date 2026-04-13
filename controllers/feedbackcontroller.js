import Feedback from "../models/feedback.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import  ApiError  from "../utils/ApiError.js";
import  asyncHandler  from "../utils/asyncHandler.js";

//  CREATE FEEDBACK
export const createFeedback = asyncHandler(async (req, res) => {

    const { message, rating } = req.body;

    if (!message) {
        throw new ApiError(400, "Message is required");
    }

    const feedback = await Feedback.create({
        userId: req.user._id,
        message,
        rating
    });

    return res
        .status(201)
        .json(new ApiResponse(201, feedback, "Feedback created successfully"));
});


//  GET ALL FEEDBACK (ADMIN VIEW)
export const getAllFeedback = asyncHandler(async (req, res) => {

    const feedbacks = await Feedback.find()
        .populate("userId", "name email");

    return res
        .status(200)
        .json(new ApiResponse(200, feedbacks, "All feedback fetched"));
});

//  DELETE FEEDBACK (optional)
export const deleteFeedback = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Feedback ID is required");
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
        throw new ApiError(404, "Feedback not found");
    }

    await Feedback.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Feedback deleted successfully"));
});