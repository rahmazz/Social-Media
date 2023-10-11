import mongoose, { Schema, Types, model } from "mongoose";

const tokenSchema = new Schema(
    {
        token:{
            type:String,
            required:true,
        },
        isValid:{
            type:Boolean,
            default:true
        },
        expiresIn:{
            type:Number,
        },
        agent:{
            type:String
        },
        userId:{
            type:Types.ObjectId,
            ref:'User',
        }
    },
    {
        timestamps:true
    }
)

const tokenModel =mongoose.models.token|| model( "Token", tokenSchema )
export default tokenModel