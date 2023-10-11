import { StatusCodes } from "http-status-codes";
import postsModel from "../../../../DB/models/posts.model.js";
import userModel from "../../../../DB/models/user.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import cloudinary from "../../../utils/cloudinary.js";
import commentsModel from "../../../../DB/models/comments.model.js";
import commentReplyModel from "../../../../DB/models/commentReply.model.js";


// Add a reply 
export const addReply = async (req, res, next) => {
  const { postId, replyBody,commentId  } = req.body;
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`User not found`));
  }
  const post = await postsModel.findById(postId);
  if (!post) {
    return next(new ErrorClass(`post not found`,StatusCodes.NOT_FOUND));
  }
  if (post.isDeleted) {
    return next(new ErrorClass(`this post is soft deleted you can't reply`,StatusCodes.BAD_REQUEST));
  }
  const comment = await commentsModel.findById(commentId)
  if (!comment) {
    return next(new ErrorClass(`comment not found`,StatusCodes.NOT_FOUND));
  }
  const reply = await commentReplyModel.create({
    replyBody,
    postId,
    commentId,
    createdBy: req.user._id,
  });
  await comment.updateOne({$push:{replies:reply._id}})
  return res.status(StatusCodes.CREATED).json({ message: "reply added successfully", reply });
};


// Update a reply
export const updateReply = async (req, res, next) => {
  const { replyId } = req.params;
    // Find the reply in the database
    const reply = await commentReplyModel.findById(replyId);
    if (!reply) {
      return next(new ErrorClass(`reply not found`,StatusCodes.NOT_FOUND));
    }
    // check if who want to update reply is reply owner 
    if (reply.createdBy.toString() != req.user._id.toString()) {
      return next(new ErrorClass(`you cannot update this reply`,StatusCodes.BAD_REQUEST));
    }
    reply.replyBody = req.body.replyBody;

    // Update the reply fields
    const updatedReply = await reply.updateOne(req.body);

    return res.status(StatusCodes.ACCEPTED).json({ message: "reply updated successfully", updatedReply });
} 


// Delete a reply
export const deleteReply = async (req, res, next) => {
  const { replyId } = req.params;
   // Find the reply in the database
   const reply = await commentReplyModel.findById(replyId);

   if (!reply) {
     return next(new ErrorClass(`reply not found`,StatusCodes.NOT_FOUND));
   }
   // check if who want to delete reply is reply owner 
   if (reply.createdBy.toString() != req.user._id.toString()) {
     return next(new ErrorClass(`you cannot delete this reply`,StatusCodes.BAD_REQUEST));
   }
    // Delete the reply
    const deletedReply = await reply.deleteOne({replyId});

    // Remove the reply's ID from the comments's replirs array
    await commentsModel.updateOne({$pull:{replies:replyId}})

    return res.status(StatusCodes.ACCEPTED).json({ message: "reply deleted successfully" ,deletedReply});
} 


// Like a reply
export const likeReply = async (req, res, next) => {
  const { replyId } = req.params;
    // Find the reply in the database
    const reply = await commentReplyModel.findById(replyId)
    if (!reply) {
      return next(new ErrorClass(`reply not found`,StatusCodes.NOT_FOUND));
    }

    // Check if the user has already liked the reply
    if (reply.likes.includes(req.user._id)) {
      return next(new ErrorClass(`User has already liked the reply`,StatusCodes.BAD_REQUEST));
v    }

    // Add the user's ID to the reply's likes array
    reply.likes.push(req.user._id);

    // Save the updated reply
    await reply.save();

    return res.status(StatusCodes.ACCEPTED).json({ message: "reply liked successfully" ,reply});
} 

// Unlike a reply
export const unLikeReply = async (req, res, next) => {
  const { replyId } = req.params;
  // Find the reply in the database
  const reply = await commentReplyModel.findById(replyId)
  if (!reply) {
    return next(new ErrorClass(`reply not found`,StatusCodes.NOT_FOUND));
  }

    // Check if the user has liked the reply
    if (!reply.likes.includes(req.user._id)) {
      return next(new ErrorClass(`User has not liked the reply before`,StatusCodes.BAD_REQUEST));
    }
    // Remove the user's ID from the reply's likes array
    reply.likes.pull(req.user._id);

    // Save the updated reply
    await reply.save();

    return res.status(StatusCodes.ACCEPTED).json({ message: "reply un liked successfully" ,reply});
  } 



