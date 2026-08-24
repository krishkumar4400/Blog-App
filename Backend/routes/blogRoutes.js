import { Router } from "express";
import {
  addComment,
  addNewBlog,
  deleteBlogById,
  getAllBlogs,
  getBlogById,
  getBlogComment,
  togglePublish,
} from "../controllers/blogController.js";
import upload from "../middlewares/multer.js";
import auth from "../middlewares/auth.js";
import { postBlog } from "../controllers/postBlog.js";

const blogRouter = Router();

/**
 * Create a new blog post.
 * @route POST /api/blog/add-blog
 * @access Private
 * @middleware upload.single("image") - uploads the blog cover image
 * @param {Object} req.body - blog title, content, category, and other metadata
 * @returns {Object} created blog details
 */
blogRouter.post("/add-blog", upload.single("image"), auth, addNewBlog);

/**
 * Fetch all published or available blog posts.
 * @route GET /api/blog/get-all-blogs
 * @access Public
 * @returns {Array<Object>} list of blogs
 */
blogRouter.get("/get-all-blogs", getAllBlogs);

/**
 * Fetch details for a single blog by its ID.
 * @route GET /api/blog/get-blog/:blogId
 * @access Public
 * @param {string} req.params.blogId - unique blog identifier
 * @returns {Object} blog details
 */
blogRouter.get("/get-blog/:blogId", getBlogById);

/**
 * Delete a blog post by ID.
 * @route POST /api/blog/delete
 * @access Private
 * @param {string} req.body.blogId - blog identifier to delete
 * @returns {Object} deletion result
 */
blogRouter.post("/delete", auth, deleteBlogById);

/**
 * Toggle a blog's publish/unpublish status.
 * @route POST /api/blog/toggle-publish
 * @access Private
 * @param {string} req.body.blogId - blog identifier to toggle
 * @returns {Object} updated publish status
 */
blogRouter.post("/toggle-publish", auth, togglePublish);

/**
 * Add a comment to a blog.
 * @route POST /api/blog/add-comment
 * @access Public
 * @param {Object} req.body - comment content and blog reference
 * @returns {Object} created comment data
 */
blogRouter.post("/add-comment", addComment);

/**
 * Fetch all comments for a specific blog.
 * @route POST /api/blog/comments
 * @access Public
 * @param {string} req.body.blogId - blog identifier whose comments are requested
 * @returns {Array<Object>} list of comments
 */
blogRouter.post("/comments", getBlogComment);

/**
 * Create a blog post using the post-blog flow.
 * @route POST /api/blog/post-blog
 * @access Public
 * @param {Object} req.body - blog data to be processed by the posting utility
 * @returns {Object} blog creation result
 */
blogRouter.post("/post-blog", postBlog);

export default blogRouter;
