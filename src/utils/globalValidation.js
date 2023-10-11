import joi from "joi"
import { globalValidationFields } from "../middleWare/validation.js"

export const idVal =  {
    body:joi.object().required().keys({}),
    params:joi.object().required().keys({
        id:globalValidationFields.id 
    }),
    query:joi.object().required().keys({}),
}
