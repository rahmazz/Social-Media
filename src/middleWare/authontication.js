import jwt from "jsonwebtoken"
import { asyncHandeller } from "../utils/errorHandeling.js";
import userModel from "../../DB/models/user.model.js";
import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "../utils/errorClass.js";
import tokenModel from "../../DB/models/token.model.js";


export const roles = {
    admin : 'Admin',
    user : 'User',
    hr:'HR'
}
Object.freeze(roles)
export const auth = (roles = []) =>{
        return asyncHandeller(
        async(req,res,next) =>{
        const {authorization}=req.headers
    
        if(!authorization?.startsWith(process.env.TOKEN_BEARER)){
            return next(new ErrorClass("authorization is required or In-Valid Bearer key",StatusCodes.BAD_REQUEST))
        }
    
        const token = authorization.split(process.env.TOKEN_BEARER)[1]
        if (!token) {
            return next(new ErrorClass("token is required",StatusCodes.BAD_REQUEST))
        }
        const tokenIsValid = await tokenModel.findOne({token , isValid:true})
        if (!tokenIsValid) {
            return next(new ErrorClass("token is expired or logged out",StatusCodes.BAD_REQUEST))
        }
        const decoded = jwt.verify(token , process.env.TOKEN_SIGNITURE)
        if(!decoded?.id){
            return next(new ErrorClass("In-Valid token payload",StatusCodes.BAD_REQUEST))
        }
        const user = await userModel.findById(decoded.id).select('-password')
        if(!user){
            return next(new ErrorClass("Not register account",StatusCodes.BAD_REQUEST))
        }
        if (!user.confirmEmail) {
            return next(new ErrorClass("you must confirm your email before login",StatusCodes.NOT_ACCEPTABLE))
        }
        if (user.isDeleted) {
            return next(new ErrorClass("this account is soft deleted please login to activate it first",StatusCodes.NOT_ACCEPTABLE))
        }
        if (!roles.includes(user.role)) {
            return next(new ErrorClass("Not authorized user to access here",StatusCodes.FORBIDDEN))
        }
        req.user=user
        return next()
        })
} 