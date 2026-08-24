import mongoose from "mongoose";
import imageKit from "../config/imageKit.js";
import Blog from "../Model/Blog.js";
import fs from "fs";
import Comment from "../Model/Comment.js";

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

export const addNewBlog = async (req, res) => {
  try {
    const { title, subTitle, description, isPublished, category } = JSON.parse(
      req.body.blog,
    );
    const imageFile = req.file;

    // check if all fields are present
    if (!title || !description || !category || !imageFile) {
      return res.status(400).json({
        message: "Mising required fields",
        success: false,
      });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    // upload image to imagekit
    const response = await imageKit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    // optimize through imagekit URL transformation
    const optimizedImageURL = imageKit.url({
      path: response.filePath,
      transformations: [
        { quality: "auto" }, // auto compression
        { format: "webp" }, // convert to modern format
        { width: "1280" }, // width resizing
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

export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!blogId) {
      return res.status(404).json({
        message: "blog id is missing",
        success: false,
      });
    }

    // validate mongodb objectid
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

    //  Delete all comments associated with the blog
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
