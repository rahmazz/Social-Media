import mongoose, { Schema, Types, model } from "mongoose";

const postsSchema = new Schema(
    {
        content:{
            type:String,
            required:true,
        },
        image:{
            type:Object,
            public_id:{type:String},
            secure_url:{type:String}
        },
        video:{
            type:Object,
            public_id:{type:String},
            secure_url:{type:String}
        },
        likes:[{
            type:Types.ObjectId,
            ref:'User',
        }],
        createdBy:{
            type:Types.ObjectId,
            ref:'User',
            required:true
        },
        privacy:{
            type:String,
            enum:['public','only me'],
            default:'public'
        },
        comments:[{
            type:Types.ObjectId,
            ref:'Comments',
        }],
        isDeleted:{
            type:Boolean,
            default:false
        },
    },
    {
        timestamps:true
    }
)


const postsModel =mongoose.models.Posts|| model( "Posts", postsSchema )
export default postsModel