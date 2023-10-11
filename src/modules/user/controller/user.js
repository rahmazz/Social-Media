import userModel from "../../../../DB/models/user.model.js";
import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "../../../utils/errorClass.js";
import cloudinary from "../../../utils/cloudinary.js";
import { compare, hash } from "../../../utils/hashAndCompare.js";
import tokenModel from "../../../../DB/models/token.model.js";
import CryptoJS from 'crypto-js';
import htmlContent from "../../../utils/html.js";
import { nanoid } from "nanoid";
import sendEmail from "../../../utils/email.js";
import postsModel from "../../../../DB/models/posts.model.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";

export const getUserProfile = async (req, res, next) => {
  const { email } = req.body;
  // Find a user in the database
  const user = await userModel.findOne({email});
  if (!user) {
    return next(new ErrorClass(`user not found`));
  }
  //get users profile and public posts
  const mongooseQuery = postsModel.find({createdBy:user._id , privacy:'public'});
  const api = new ApiFeatures(mongooseQuery,req.query).pagination(postsModel).search().sort().filter().select()
  const post= await api.mongooseQuery
    if (!post) {
      return next(new ErrorClass(` no posts found`,StatusCodes.NOT_FOUND));
    }
  // Return the user profile
  return res.status(StatusCodes.ACCEPTED).json({ message: `welcome to ${user.name} profile`
  , user 
  ,post,
  totalPages: api.queryData.totalPages ,
  nextPage:api.queryData.nextPage,
  currentPage:api.queryData.page,
  previousPage:api.queryData.previousPage,
  modelCounts:api.queryData.modelCounts,
});
}

export const updateProfile = async (req, res, next) => {
    // Find a user in the database
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`user not found`));
  }
  // Check If email already exists for another user, return an error
  if (req.body.email) {
    const emailExist = await userModel.findOne({
      email: req.body.email,
      _id: { $ne: req.user._id },
  });
  if (emailExist) {
      return next(new ErrorClass(`email is already exist enter another email` , StatusCodes.CONFLICT));
  }}
  req.body.confirmEmail = false
  const code = nanoid(6)//Generate a confirmation code
  const html = htmlContent(code)// Generate HTML content for the confirmation email
  const isEmailSent = await sendEmail({to:req.body.email ,subject:"Confirmation Email",html})
  if (!isEmailSent) {
      return next(new ErrorClass(`email rejected`,StatusCodes.BAD_REQUEST))
  }
  if (isUser.profileImage?.public_id) {
    // Override existing profile picture if exist with new picture
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: isUser.profileImage.public_id,
      }
    );
    req.body.profileImage ={secure_url, public_id }
  }
  req.body.code = code
  //Encrypt the phone number 
  if (req.body.phone) {
    req.body.phone = CryptoJS.AES.encrypt(req.body.phone,process.env.PHONE_ENCRPTION_KEY).toString()
  }
  // Update the user profile 
  const updatedUser = await userModel.updateOne({_id:req.query.id},req.body)
  return res.status(StatusCodes.ACCEPTED).json({ message: `Profile Updated successfully`, updatedUser });
};

export const addProfilePicture = async (req, res, next) => {
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`user not found`));
  }
  if (isUser.profileImage?.public_id) {
    // Override existing profile picture if exist with new picture
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: isUser.profileImage.public_id,
      }
    );
    isUser.profileImage.secure_url = secure_url;
    isUser.profileImage.public_id = public_id;
  } else {
    // Upload new profile picture (the first picture for this user)
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.FOLDER_CLOUD_NAME}/profileImage`,
      }
    );
    isUser.profileImage = { secure_url, public_id };
  }
  await isUser.save();

  return res.status(StatusCodes.CREATED).json({ message: "picture added successfully", isUser });
};

export const addCoverPicture = async (req, res, next) => {
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`user not found`));
  }
  const existingCoverImages = isUser.coverImages || []; // Get the existing cover images

  const newCoverImages = [];
  for (const file of req.files) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.FOLDER_CLOUD_NAME}/coverImage` }
    );
    newCoverImages.push({ secure_url, public_id });
  }
  const updatedCoverImages = [...existingCoverImages, ...newCoverImages]; // Combine existing and new cover images

  isUser.coverImages = updatedCoverImages;
  await isUser.save();

  return res.status(StatusCodes.CREATED).json({ message: "Cover pictures added successfully", isUser });
};

export const addVideo = async (req, res, next) => {
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`user not found`));
  }
     const { secure_url ,public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.FOLDER_CLOUD_NAME}/userVideoes`,
        resource_type:"video"
      }
    );
    isUser.video = { secure_url , public_id};
    await isUser.save();
  return res.status(StatusCodes.CREATED).json({ message: "Video added successfully", isUser });
}


export const updatePassword = async (req, res, next) => {
  const  { newPass,password } = req.body;
  // Find a user in the database
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`user not found`));
  }
  //compare user old pass with pass he entered
  const matchpass = compare(password,isUser.password)
  if (!matchpass) {
    return next(new Error("password not match your password please enter the right password"));
  }
  //make sure that user old pass and new pass is diffrent
  if (newPass == password) {
    return next(new ErrorClass(`New password must be different from your old password`));
  }
  const newHash = hash(newPass);

  const updatedUser = await isUser.updateOne({ password: newHash });
  return res.status(StatusCodes.ACCEPTED).json({ message: "Password Updated successfully", updatedUser });
};

export const softDelete = async (req, res, next) => {
 //change is Deleted in database
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { isDeleted: true },
    { new: true }
  );
  // make any token to this user inValid
  const tokens = await tokenModel.find({userId:user._id})
        tokens.forEach( async (token) => {
            token.isValid = false
            await token.save()
        });
  return res.status(StatusCodes.ACCEPTED).json({ message: "User Deleted Sucessfully", user });
};
