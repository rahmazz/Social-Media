import joi from "joi";
import { globalValidationFields } from "../../middleWare/validation.js";


export const headers = joi.object({
    authorization:globalValidationFields.headers,
    }).required()

    
export const addComment = joi.object({
    postId:globalValidationFields.id,
    commentBody:joi.string().required(),
    }).required()


export const updateComment = joi.object({
    commentId:globalValidationFields.id,
    commentBody:joi.string(),
    }).required()


export const deleteComment = joi.object({
    commentId:globalValidationFields.id
    }).required()


export const likeComment = joi.object({
    commentId:globalValidationFields.id
    }).required()


export const unLikeComment = joi.object({
    commentId:globalValidationFields.id
    }).required()







