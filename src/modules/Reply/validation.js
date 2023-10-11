import joi from "joi";
import { globalValidationFields } from "../../middleWare/validation.js";


export const headers = joi.object({
    authorization:globalValidationFields.headers,
    }).required()

    
export const addReply = joi.object({
    postId:globalValidationFields.id,
    commentId:globalValidationFields.id,
    replyBody:joi.string().required(),
    }).required()


export const updatedReply = joi.object({
    replyId:globalValidationFields.id,
    commentId:globalValidationFields.id,
    postId:globalValidationFields.id,
    replyBody:joi.string(),
    }).required()


export const deleteReply = joi.object({
    replyId:globalValidationFields.id
    }).required()


export const likeReply = joi.object({
    replyId:globalValidationFields.id
    }).required()


export const unLikeReply = joi.object({
    replyId:globalValidationFields.id
    }).required()







