import { StatusCodes } from "http-status-codes";
import postsModel from "../../../../DB/models/posts.model.js";
import userModel from "../../../../DB/models/user.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import commentsModel from "../../../../DB/models/comments.model.js";
import commentReplyModel from "../../../../DB/models/commentReply.model.js";


// Add a comment 
export const addComment = async (req, res, next) => {
  const { postId, commentBody  } = req.body;
  //make sure user is valid
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`User not found`));
  }
  //make sure post is exist and not soft deleted
  const post = await postsModel.findById(postId);
  if (!post) {
    return next(new ErrorClass(`post not found`,StatusCodes.NOT_FOUND));
  }
  if (post.isDeleted) {
    return next(new ErrorClass(`this post is soft deleted can't write comment`,StatusCodes.BAD_REQUEST));
  }
  //create comment
  const comment = await commentsModel.create({
    commentBody,
    postId,
    createdBy: req.user._id,
  });
  //push the comment on comments array 
  await postsModel.updateOne({_id:postId},{$push:{comments:comment._id}})
  return res.status(StatusCodes.CREATED).json({ message: "comment added successfully", comment });
};

// Update a comment
export const updateComment = async (req, res, next) => {
  const { commentId } = req.params;
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`User not found`));
  }
    // Find the comment in the database
    const comment = await commentsModel.findById(commentId);

    if (!comment) {
      return next(new ErrorClass(`comment not found`,StatusCodes.NOT_FOUND));
    }
    // check if who want to update comment is comment owner 
    if (comment.createdBy.toString() != req.user._id.toString()) {
      return next(new ErrorClass(`you cannot update this comment`,StatusCodes.BAD_REQUEST));
    }
    comment.commentBody = req.body.commentBody;

    // Update the comment fields
    const updatedcomment = await comment.updateOne(req.body);

    return res.status(StatusCodes.ACCEPTED).json({ message: "comment updated successfully", updatedcomment });
} 

// Delete a comment
export const deleteComment = async (req, res, next) => {
  const { commentId } = req.params;
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`User not found`));
  }
   // Find the comment in the database
   const comment = await commentsModel.findById(commentId);

   if (!comment) {
     return next(new ErrorClass(`comment not found`,StatusCodes.NOT_FOUND));
   }
   // check if who want to update comment is comment owner 
   if (comment.createdBy.toString() != req.user._id.toString()) {
     return next(new ErrorClass(`you cannot update this comment`,StatusCodes.BAD_REQUEST));
   }
    // Delete the reply's comments
    await commentReplyModel.deleteMany({ _id: { $in:comment.replies} } );

    // Delete the comment
    const deletedComment = await comment.deleteOne({commentId});
    // remove the comment from comments array in postmodel 
    await postsModel.updateOne({$pull:{comments:commentId}})


    return res.status(StatusCodes.ACCEPTED).json({ message: "comment deleted successfully" ,deletedComment});
} 

// Like a comment
export const likeComment = async (req, res, next) => {
  const { commentId } = req.params;
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`User not found`));
  }
    // Find the comment in the database
    const comment = await commentsModel.findById(commentId)
    if (!comment) {
      return next(new ErrorClass(`comment not found`,StatusCodes.NOT_FOUND));
    }

    // Check if the user has already liked the comment
    if (comment.likes.includes(req.user._id)) {
      return next(new ErrorClass(`User has already liked the comment`,StatusCodes.BAD_REQUEST));
v    }

    // Add the user's ID to the comment's likes array
    comment.likes.push(req.user._id);

    // Save the updated comment
    await comment.save();

    return res.status(StatusCodes.ACCEPTED).json({ message: "comment liked successfully" ,comment});
} 

// Unlike a comment
export const unLikeComment = async (req, res, next) => {
  const { commentId } = req.params;
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`User not found`));
  }
  // Find the comment in the database
  const comment = await commentsModel.findById(commentId)
  if (!comment) {
    return next(new ErrorClass(`comment not found`,StatusCodes.NOT_FOUND));
  }

    // Check if the user has liked the comment
    if (!comment.likes.includes(req.user._id)) {
      return next(new ErrorClass(`User has not liked the comment before`,StatusCodes.BAD_REQUEST));
    }
    // Remove the user's ID from the comment's likes array
    comment.likes.pull(req.user._id);

    // Save the updated comment
    await comment.save();

    return res.status(StatusCodes.ACCEPTED).json({ message: "comment un liked successfully" ,comment});
} 



