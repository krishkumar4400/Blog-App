import { Router } from "express";
import {
  adminLogin,
  approveComment,
  deleteComment,
  generateContent,
  getAllBlogsAdmin,
  getAllcomments,
  getDashboardData,
  logout,
} from "../controllers/adminController.js";
import auth from "../middlewares/auth.js";

const adminRouter = Router();

/**
 * Authenticate an admin user and create a session.
 * @route POST /api/admin/login
 * @access Public
 * @param {Object} req.body - admin email and password
 * @returns {Object} authentication result and token/session data
 */
adminRouter.post("/login", adminLogin);

/**
 * Get all blogs available to the admin dashboard.
 * @route GET /api/admin/all-blogs
 * @access Private
 * @returns {Array<Object>} list of blog records
 */
adminRouter.get("/all-blogs", auth, getAllBlogsAdmin);

/**
 * Fetch all comments for admin moderation.
 * @route GET /api/admin/comments
 * @access Private
 * @returns {Array<Object>} list of comments
 */
adminRouter.get("/comments", auth, getAllcomments);

/**
 * Retrieve summary metrics for the admin dashboard.
 * @route GET /api/admin/dashboard-data
 * @access Private
 * @returns {Object} dashboard stats and overview data
 */
adminRouter.get("/dashboard-data", auth, getDashboardData);

/**
 * Delete a comment from the system.
 * @route POST /api/admin/delete-comment
 * @access Private
 * @param {string} req.body.commentId - unique identifier of the comment to remove
 * @returns {Object} deletion status
 */
adminRouter.post("/delete-comment", auth, deleteComment);

/**
 * Approve a pending comment.
 * @route POST /api/admin/approve-comment
 * @access Private
 * @param {string} req.body.commentId - unique identifier of the comment to approve
 * @returns {Object} approval result
 */
adminRouter.post("/approve-comment", auth, approveComment);

/**
 * Log out the currently authenticated admin.
 * @route GET /api/admin/logout
 * @access Public
 * @returns {Object} logout confirmation
 */
adminRouter.get("/logout", logout);

/**
 * Generate AI-driven content for the admin workflow.
 * @route POST /api/admin/generate-content
 * @access Private
 * @param {Object} req.body - prompt or generation payload
 * @returns {Object} generated content response
 */
adminRouter.post("/generate-content", auth, generateContent);

export default adminRouter;
