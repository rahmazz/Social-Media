import joi from "joi";
import { globalValidationFields } from "../../middleWare/validation.js";

export const signup = joi.object({
                email: globalValidationFields.email,
                password: globalValidationFields.password,
                cpassword: globalValidationFields.cpassword,
                name: globalValidationFields.name,
                phone: globalValidationFields.phone,
                age:globalValidationFields.age,
                role:joi.string().valid("User" , "Admin"),
        }).required()


export const signIn = joi.object({
                email:globalValidationFields.email,
                password:globalValidationFields.password,
        }).required()


export const refreshToken = joi.object({
        token:globalValidationFields.authorization
        }).required()


export const confirmemail = joi.object({
        code:globalValidationFields.code})
        .required()


export const sendChangePasswordCode =joi.object({
        email:globalValidationFields.email,
        }).required()



export const resetPassword =joi.object({
        email:globalValidationFields.email,
        code:globalValidationFields.code,
        password:globalValidationFields.password,
        cpassword:globalValidationFields.cpassword
        }).required()

