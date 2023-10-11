import mongoose, { Schema, Types, model } from "mongoose";

const commentReplySchema = new Schema(
    {
        replyBody:{
            type:String,
            required:true,
        },
        createdBy:{
            type:Types.ObjectId,
            ref:'User',
            required:true
        },
        commentId:{
            type:Types.ObjectId,
            ref:'Comments',
            required:true
        },
        likes:[{
            type:Types.ObjectId,
            ref:'User',
        }],
        postId:{
            type:Types.ObjectId,
            ref:'Posts',
            required:true
        },
    },
    {
        timestamps:true
    }
)

const commentReplyModel = mongoose.models.CommentReply|| model( "CommentReply", commentReplySchema )
export default commentReplyModel