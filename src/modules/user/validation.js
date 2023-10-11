import joi from "joi";
import { globalValidationFields } from "../../middleWare/validation.js";




export const getUserProfile = joi.object({
        email:globalValidationFields.email,
        }).required()


export const headers = joi.object({
        authorization:globalValidationFields.headers,
        }).required()


export const updateProfile = joi.object({
        email:joi.string().email({ minDomainSegments:2 , maxDomainSegments:3 , tlds:{ allow: [ 'com' , 'edu' , 'eg' , 'net'] } }),
        age:joi.number().integer().positive().min(18).max(95),
        phone:joi.string().min(11).max(11),
        name:joi.string().min(3).max(20),
        file:globalValidationFields.file
        }).required()


export const addProfilePicture = joi.object({
    file:globalValidationFields.file.required(),
    }).required()



export const addCoverPicture = joi.object({
    file:joi.array().items(globalValidationFields.file.required()).required()
    }).required()



export const addVideo = joi.object({
    file:globalValidationFields.file.required(),
    }).required()


export const updatePassword = joi.object({
    password:globalValidationFields.password,
    newPass:joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    cPass:joi.string().valid(joi.ref("newPass")).required(),
   }).required() 



