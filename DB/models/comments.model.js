import mongoose, { Schema, Types, model } from "mongoose";

const commentsSchema = new Schema(
    {
        commentBody:{
            type:String,
            required:true
        },
        createdBy:{
            type:Types.ObjectId,
            ref:'User',
            required:true
        },
        postId:{
            type:Types.ObjectId,
            ref:'Posts',
            required:true
        },
        replies:[{
            type:Types.ObjectId,
            ref:'Reply',
        }],
        likes:[{
            type:Types.ObjectId,
            ref:'User',
        }],
    },
    {
        timestamps:true
    }
)

const commentsModel = mongoose.models.Comments|| model( "Comments", commentsSchema )
export default commentsModel