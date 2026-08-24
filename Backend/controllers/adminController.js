import jwt from "jsonwebtoken";
import Blog from "../Model/Blog.js";
import Comment from "../Model/Comment.js";
import main from "../config/gemini.js";

/**
 * Admin-related controller actions for authentication, moderation, and dashboard operations.
 */

/**
 * Authenticate an admin and issue a JWT token.
 *
 * @async
 * @function adminLogin
 * @param {import("express").Request} req - Express request object containing the admin email and password.
 * @param {import("express").Response} res - Express response object used to send the auth result.
 * @returns {Promise<void>} JSON response with login success, token, or validation errors.
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        message: "Missing details",
        success: false,
      });
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.json({
        message: "incorrect email or password",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.json({
      token,
      success: true,
      message: "You are logged in",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Some error occured while login",
      success: false,
      error,
    });
  }
};

/**
 * Fetch every blog for the admin panel, ordered by newest first.
 *
 * @async
 * @function getAllBlogsAdmin
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response containing all blog records.
 */
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    return res.json({
      blogs,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Some error occured while fetching blogs",
      success: false,
      error,
    });
  }
};

/**
 * Retrieve all comments with the associated blog data for moderation.
 *
 * @async
 * @function getAllcomments
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response with populated comment records.
 */
export const getAllcomments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("blog")
      .sort({ createdAt: -1 });
    return res.json({
      comments,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Some error occured while fetching comments",
      success: false,
      error,
    });
  }
};

/**
 * Build the summary payload for the admin dashboard.
 *
 * @async
 * @function getDashboardData
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response containing recent blogs, totals, and draft count.
 */
export const getDashboardData = async (req, res) => {
  try {
    const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(5);
    const blogs = await Blog.countDocuments();
    const comments = await Comment.countDocuments();
    const drafts = await Blog.countDocuments({ isPublished: false });

    const dashboardData = {
      recentBlogs,
      blogs,
      comments,
      drafts,
    };

    return res.json({
      dashboardData,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Some error occured while fetching dashboard data",
      success: false,
      error,
    });
  }
};

/**
 * Delete a comment from the database.
 *
 * @async
 * @function deleteComment
 * @param {import("express").Request} req - Express request object containing the comment ID.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response confirming deletion or reporting an error.
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;

    await Comment.findByIdAndDelete(commentId);

    return res.json({
      message: "comment deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Some error occured while deleting comment",
      success: false,
      error,
    });
  }
};

/**
 * Approve a submitted comment so it becomes visible to readers.
 *
 * @async
 * @function approveComment
 * @param {import("express").Request} req - Express request object containing the comment ID.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response with approval status and updated comment data.
 */
export const approveComment = async (req, res) => {
  try {
    const { commentId } = req.body;
    const comment = await Comment.findByIdAndUpdate(commentId, {
      isApproved: true,
    });

    return res.json({
      message: "comment approved successfully",
      success: true,
      comment,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Some error occured while approving comment",
      success: false,
      error,
    });
  }
};

/**
 * Log out the admin user from the active session.
 *
 * @async
 * @function logout
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response confirming logout.
 */
export const logout = async (req, res) => {
  try {
    return res.json({
      message: "you are logged out",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Some error occured while logging you out",
      success: false,
      error,
    });
  }
};

/**
 * Generate a blog content draft using the configured AI model.
 *
 * @async
 * @function generateContent
 * @param {import("express").Request} req - Express request object with the content prompt.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response with the generated content or an error message.
 */
export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    const content = await main(
      prompt + " Generate a blog content for this topic in simple text format",
    );
    return res.json({
      content,
      success: true,
      message: "content generated",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Some error occured while generating blog content",
      success: false,
      error,
    });
  }
};
