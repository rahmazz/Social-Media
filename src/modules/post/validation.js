import joi from "joi";
import { globalValidationFields } from "../../middleWare/validation.js";




export const headers = joi.object({
    authorization:globalValidationFields.headers,
    }).required()
    

export const addPost = joi.object({
    content:joi.string().min(3).max(200).required(),
    file:joi.object({
        image:joi.array().items(globalValidationFields.file.required()),
        video:joi.array().items(globalValidationFields.file.required()),
    }),    
    privacy:joi.string().valid("public" , "only me"),
    }).required()


export const updatePost = joi.object({
    content:joi.string().min(3).max(200),
    file:joi.object({
        image:joi.array().items(globalValidationFields.file.required()),
        video:joi.array().items(globalValidationFields.file.required()),
    }),    
    privacy:joi.string().valid("public" , "only me"),
    postId:globalValidationFields.id
    }).required()


export const getAllPosts = joi.object({
    userId:globalValidationFields.id
    }).required()


    
export const getPostById = joi.object({
    postId:globalValidationFields.id
    }).required()



export const likePost = joi.object({
    postId:globalValidationFields.id
    }).required()


export const unLikePost = joi.object({
    postId:globalValidationFields.id
    }).required()


export const deletePost = joi.object({
    postId:globalValidationFields.id
    }).required()


export const softDelete = joi.object({
    postId:globalValidationFields.id
    }).required()


export const updatePostPrivacy = joi.object({
    postId:globalValidationFields.id,
    privacy:joi.string().valid("public" , "only me").required(),
    }).required()






