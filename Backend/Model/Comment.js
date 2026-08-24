import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, require: true },
    name: { type: String, require: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "blog", required: true },
    isApproved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const Comment =
  mongoose.model.Comment || mongoose.model("Comment", commentSchema);

export default Comment;
