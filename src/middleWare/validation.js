import joi from "joi"
import { Types } from "mongoose"


export const validation = (schema ,considerHeaders = false) =>{
    return (req,res,next) =>{
    let dataFromAllMethods = {...req.body,...req.params ,...req.query}
        if (req.file || req.files) {
            dataFromAllMethods.file = req.file ||req.files
        }
        if (req.headers.authorization && considerHeaders) {
            dataFromAllMethods ={authorization: req.headers.authorization}
        }
        const validationResult = schema.validate(dataFromAllMethods , { abortEarly: false})
            if (validationResult.error) {
                res.json({message:"Validation Error" , ERR: validationResult.error.details})
            }
            return next()
}
}

const validateObjectId = ( value , helper) =>{
    return Types.ObjectId.isValid(value) ? true : helper.message('In-Valid object-Id from validation')
}


export const globalValidationFields = {
    email:joi.string().email({ minDomainSegments:2 , maxDomainSegments:3 , tlds:{ allow: [ 'com' , 'edu' , 'eg' , 'net'] } }).required(),
    password:joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
    cpassword:joi.string().valid(joi.ref("password")).required(),
    userName:joi.string().alphanum().min(3).max(15).required(),
    name:joi.string().min(3).max(20),
    fName:joi.string().min(3).max(15).required(),
    lName:joi.string().min(3).max(15).required(),
    age:joi.number().integer().positive().min(18).max(95),
    phone:joi.string().min(11).max(11).required(),
    id:joi.string().custom(validateObjectId).required(),
    gender:joi.string().valid("male" , "female"),
    code:joi.string().min(6).max(6).required(),
    file:joi.object({
        size:joi.number().positive().required(),
        path:joi.string().required(),
        filename:joi.string().required(),
        destination:joi.string(),
        mimetype:joi.string().required(),
        encoding:joi.string().required(),
        originalname:joi.string().required(),
        fieldname:joi.string().required(),
    }),
    authorization:joi.string().required(),
    headers:joi.string().required(),
}
