import { StatusCodes } from "http-status-codes";
import sendEmail from "../../../utils/email.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { compare, hash } from "../../../utils/hashAndCompare.js";
import htmlContent from "../../../utils/html.js";
import userModel from "../../../../DB/models/user.model.js";
import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';
import jwt from "jsonwebtoken"
import { generateToken } from "../../../utils/generateAndVerifiyToken.js";
import tokenModel from "../../../../DB/models/token.model.js";

// sign up
export const signUp = async(req,res,next) =>{
        //check if email exist before
        const checkEmail = await userModel.findOne({email:req.body.email})
        if(checkEmail){
            return next(new ErrorClass(`This Email ${req.body.email} already exist`,StatusCodes.CONFLICT))
        }
        //create random code
        const code = nanoid(6)
        //send email to verify account
        const html = htmlContent(code)
        const isEmailSent = await sendEmail({to:req.body.email ,subject:"Confirmation Email",html})
        if (!isEmailSent) {
            return next(new ErrorClass(`email rejected`,StatusCodes.BAD_REQUEST))
        }
        // encrypt the phone
        req.body.phone = CryptoJS.AES.encrypt(req.body.phone,process.env.PHONE_ENCRPTION_KEY).toString()
        // hash password
        req.body.password = hash(req.body.password)
        req.body.code = code
        //save user in DB
        const user = await userModel.create(req.body)
        res.status(StatusCodes.CREATED).json({message:"user added sucessfully",user});
}

//confirm Email
export const confirmEmail = async(req ,res ,next)=>{
  //recive the code then make sure it matches code existed in DB
    const {code} =req.body
    const user = await userModel.findOneAndUpdate({code},{confirmEmail:true , $unset:{ code : 1} },{new:true})
        if(!user){
            return next(new ErrorClass(`user not found`,StatusCodes.NOT_FOUND))
        }
        return res.status(StatusCodes.OK).json({message:"Email confirmed", user})
}

//signIn
export const signIn = async(req,res,next) =>{
        const {email,password}=req.body
        const user = await userModel.findOne({email})
        if(!user){
            return next(new ErrorClass("invalid login data",StatusCodes.NOT_ACCEPTABLE))
        }
        //make sure that user confirm his email
        if (!user.confirmEmail) {
            return next(new ErrorClass("you must confirm your email before login",StatusCodes.NOT_ACCEPTABLE))
        }
        //compare password
        const matchpass= compare(password,user.password)
        if(!matchpass){
            return next(new ErrorClass("invalid login data",StatusCodes.NOT_ACCEPTABLE))
        }
        //update is deleted 
        const loginUser = await user.updateOne({isDeleted:false})
        //create token to this user and store it DB
        const token = generateToken({ payload :{id:user._id,email:user.email }, expiresIn:30 * 30 *60})
        await tokenModel.create({
            token,
            userId:user._id,
            agent:req.headers['user-agent']
        })
        const refresh_token = generateToken({ payload :{id:user._id,email:user.email }, expiresIn:'1y'})
        await tokenModel.create({
            token:refresh_token,
            userId:user._id,
            agent:req.headers['user-agent']
        })
            return res.status(StatusCodes.ACCEPTED).json({message:"done",token,refresh_token})
}

//send Change Password Code
export const sendChangePasswordCode = async(req,res,next) =>{
    const {email} = req.body
    const user = await userModel.findOne({email})
        if(!user){
            return next(new ErrorClass("User NOT Found",StatusCodes.NOT_FOUND))
        }
        // generate random code and made it access for only two min
        const code = nanoid(6)
        const timestamp = Date.now()
        const codeExpirationTime = timestamp + 2 * 60 * 1000
        const html = htmlContent(code)
        sendEmail({to:req.body.email ,subject:"Forget Password",html})
        //store code and codeExpirationTime in DB
        await userModel.updateOne({email},{code , codeExpirationTime})
        return res.status(StatusCodes.ACCEPTED).json({message:"done check your email to recieve the code"})
}

//reset password
export const resetPassword = async(req, res ,next) =>{
    let { email, code ,password} =req.body
    const user = await userModel.findOne({email})
        if(!user){
            return next(new ErrorClass("invalid login data",StatusCodes.NOT_FOUND))
        }
        // comare codes
        if (user.code != code) {
            return next(new ErrorClass(`In-Valid code`,StatusCodes.BAD_REQUEST))
        }
        // make sure time didn't exceed two min
        const currentTimestape = Date.now()
        if (currentTimestape > user.codeExpirationTime) {
            return next(new ErrorClass(`expire code`,StatusCodes.BAD_REQUEST))
        }
        //hashing new password
        password = hash(password)
        await userModel.updateOne({email},{password , $unset:{code:1} })
        //logout from all other tokens 
        const tokens = await tokenModel.find({userId:user._id})
        tokens.forEach( async (token) => {
            token.isValid = false
            await token.save()
        });
        return res.status(StatusCodes.ACCEPTED).json({message:"done , try to login now"})

}

//refresh the refresh Token
export const refreshToken = async (req, res, next) => {
    const { token } = req.params;
      // Check if the old token exists in the token's document
      const isToken = await tokenModel.findOne({ token });
      if (!isToken) {
        return next(new ErrorClass("Token not found", StatusCodes.NOT_FOUND));
      }
  
      // Verify the token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.TOKEN_SIGNITURE);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          decoded = jwt.decode(token); // Retrieve the expired token's payload
        } else {
          throw error; // other errors from jwt
        }
      }
  
      if (!decoded?.id) {
        return next(new ErrorClass("Invalid token payload", StatusCodes.BAD_REQUEST));
      }
  
      // Check if the user ID exists in the database
      const user = await userModel.findById(decoded.id);
      if (!user) {
        return next(new ErrorClass("Account not found", StatusCodes.BAD_REQUEST));
      }
  
      // Generate a refresh token if the old token is expired or invalid
      if (decoded.exp <= Math.floor(Date.now() / 1000) || !isToken.isValid) {
        // Generate refresh token
        const refresh_token = generateToken({ id: decoded.id },{signature:process.env.TOKEN_SIGNITURE}, { expiresIn: '365d' });
        await tokenModel.create({
          token: refresh_token,
          userId: decoded.id,
          agent: req.headers['user-agent']
        });
  
        return res.status(StatusCodes.ACCEPTED).json({ message: "Done", refresh_token });
      }
  
      return next(new ErrorClass("This token is still valid and not expired. You don't need a refresh token.", StatusCodes.BAD_REQUEST));
} 














