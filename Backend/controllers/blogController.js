import mongoose from "mongoose";
import imageKit from "../config/imageKit.js";
import Blog from "../Model/Blog.js";
import fs from "fs";
import Comment from "../Model/Comment.js";

/**
 * Blog-related controller actions for public and authenticated blog operations.
 */

/**
 * Fetch all published blog posts available to readers.
 *
 * @async
 * @function getAllBlogs
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response with a list of published blogs.
 */
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true });
    res.status(200).json({
      blogs,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Some error occured while fetching blogs",
      success: false,
      error,
    });
  }
};

/**
 * Create a new blog post and upload its image to ImageKit before saving it.
 *
 * @async
 * @function addNewBlog
 * @param {import("express").Request} req - Express request object containing blog metadata and uploaded image file.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response with the created blog or validation errors.
 */
export const addNewBlog = async (req, res) => {
  try {
    const { title, subTitle, description, isPublished, category } = JSON.parse(
      req.body.blog,
    );
    const imageFile = req.file;

    // Validate the required fields before creating the blog.
    if (!title || !description || !category || !imageFile) {
      return res.status(400).json({
        message: "Mising required fields",
        success: false,
      });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    // Upload the original image to ImageKit to store and serve optimized versions.
    const response = await imageKit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    // Apply image transformations to improve delivery quality and performance.
    const optimizedImageURL = imageKit.url({
      path: response.filePath,
      transformations: [
        { quality: "auto" }, // auto compression
        { format: "webp" }, // convert to a modern web-friendly format
        { width: "1280" }, // resize for consistent display sizes
      ],
    });

    const image = optimizedImageURL;

    const blog = await Blog.create({
      title,
      subTitle,
      description,
      isPublished,
      category,
      image,
    });

    return res.status(201).json({
      message: "Blog added successfully",
      success: true,
      blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Some error occured while creating blog",
      success: false,
      error,
    });
  }
};

/**
 * Retrieve a single blog by its MongoDB ObjectId.
 *
 * @async
 * @function getBlogById
 * @param {import("express").Request} req - Express request object containing the blogId URL parameter.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response with the matching blog or a not-found error.
 */
export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!blogId) {
      return res.status(404).json({
        message: "blog id is missing",
        success: false,
      });
    }

    // Validate that the provided blog ID is a valid MongoDB ObjectId.
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({
        message: "Invalid Blog ID format",
        success: false,
      });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
      });
    }

    return res.status(200).json({
      blog,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Some error occured fetching blog",
      success: false,
      error,
    });
  }
};

/**
 * Remove a blog and all its related comments from the database.
 *
 * @async
 * @function deleteBlogById
 * @param {import("express").Request} req - Express request object containing the blogId in the request body.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response confirming deletion or reporting a missing record.
 */
export const deleteBlogById = async (req, res) => {
  try {
    const { blogId } = req.body;
    const blog = await Blog.findByIdAndDelete(blogId);
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
      });
    }

    // Delete all comments associated with the removed blog.
    await Comment.deleteMany({ blog: blogId });

    return res.status(200).json({
      message: "blog deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Some error occured while deleting blog",
      success: false,
      error,
    });
  }
};

/**
 * Toggle the publish state of a blog between published and draft.
 *
 * @async
 * @function togglePublish
 * @param {import("express").Request} req - Express request object containing the blog ID.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response indicating whether the blog is now published or draft.
 */
export const togglePublish = async (req, res) => {
  try {
    const { blogId } = req.body;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
      });
    }

    blog.isPublished = !blog.isPublished;

    await blog.save();

    return res.status(200).json({
      message: "blog status updated",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).status(500).json({
      message: "Some error occured while toggling the publish blog",
      success: false,
      error,
    });
  }
};

/**
 * Create a new comment for a blog and store it for moderation review.
 *
 * @async
 * @function addComment
 * @param {import("express").Request} req - Express request object containing blog ID, name, and content.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response confirming the comment was submitted.
 */
export const addComment = async (req, res) => {
  try {
    const { blog, name, content } = req.body;
    await Comment.create({
      name,
      content,
      blog,
    });

    return res.status(200).json({
      message: "comment added for review",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Some error occured while adding comment to blog",
      success: false,
      error,
    });
  }
};

/**
 * Fetch approved comments for a given blog, ordered by newest first.
 *
 * @async
 * @function getBlogComment
 * @param {import("express").Request} req - Express request object containing the blogId.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} JSON response with approved comments for the selected blog.
 */
export const getBlogComment = async (req, res) => {
  try {
    const { blogId } = req.body;
    const comments = await Comment.find({
      blog: blogId,
      isApproved: true,
    }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      comments,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Some error occured while fetching blog comments",
      success: false,
      error,
    });
  }
};
