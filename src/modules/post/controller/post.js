import { StatusCodes } from "http-status-codes";
import postsModel from "../../../../DB/models/posts.model.js";
import userModel from "../../../../DB/models/user.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import cloudinary from "../../../utils/cloudinary.js";
import commentsModel from "../../../../DB/models/comments.model.js";
import commentReplyModel from "../../../../DB/models/commentReply.model.js";
import  {ApiFeatures}  from "../../../utils/apiFeatures.js";



// Add a Post
export const addPost = async (req, res, next) => {
  const { privacy,content } = req.body;
  const isUser = await userModel.findById(req.user._id);
  if (!isUser) {
    return next(new ErrorClass(`User not found`));
  }
  if (req.files?.image) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files?.image[0].path,
      { folder: `${process.env.FOLDER_CLOUD_NAME}/image` }
  );
  req.body.image = { secure_url, public_id };
  }
  if (req.files?.video) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files?.video[0].path,
      { folder: `${process.env.FOLDER_CLOUD_NAME}/video` , 
      resource_type:"video"
    }
  );
      req.body.video = {  secure_url, public_id };
  }
  const post = await postsModel.create({
    privacy,
    content,
    createdBy: req.user._id,
    image: req.body.image,
    video: req.body.video,
  });
  return res.status(StatusCodes.CREATED).json({ message: "Post added successfully", post });
};

// Update a post
export const updatePost = async (req, res, next) => {
  const { postId } = req.params;
    // Find the post in the database
    const post = await postsModel.findById(postId);

    if (!post) {
      return next(new ErrorClass(`post not found`,StatusCodes.NOT_FOUND));
    }
    // check if who want to update post is post owner 
    if (post.createdBy.toString() != req.user._id.toString()) {
      return next(new ErrorClass(`you cannot update this post`,StatusCodes.BAD_REQUEST));
    }
    if (req.files?.image) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files?.image[0].path,
        { public_id:post.image?.public_id }
    );
    req.body.image = { secure_url, public_id };
    }
    if (req.files?.video) {
      const { secure_url ,public_id} = await cloudinary.uploader.upload(
        req.files?.video[0].path,
        { public_id:post.video?.public_id,
          resource_type:"video"
        }
    );
        req.body.video = { secure_url , public_id};
    }
    post.privacy=req.body.privacy;
    post.content = req.body.content;
    post.image = req.body.image ;
    post.video = req.body.video;

    // Update the post fields
    const updatedPost = await post.updateOne(req.body);

    return res.status(StatusCodes.ACCEPTED).json({ message: "Post updated successfully", updatedPost });
} 

// Delete a post
export const deletePost = async (req, res, next) => {
  const { postId } = req.params;

    // Find the post in the database
    const post = await postsModel.findById(postId);
    if (!post) {
      return next(new ErrorClass(`post not found`,StatusCodes.NOT_FOUND));
    }
    // check if who want to delete post is post owner 
    if (post.createdBy.toString() != req.user._id.toString()) {
      return next(new ErrorClass(`you cannot update this post`,StatusCodes.BAD_REQUEST));
    }
    // Delete the post's comments
    await commentsModel.deleteMany({ _id: { $in: post.comments } });
     // Delete the reply's comments in the comment also
     await commentReplyModel.deleteMany({ postId } );

    // Delete the post's images from Cloudinary
    if (post.image?.public_id) {
      const result = await cloudinary.uploader.destroy(post.image.public_id);
    if (result.result != 'ok') {
      return next(new ErrorClass("Error with deleting the image" , StatusCodes.NOT_FOUND));
       }
    } 
    // Delete the post's video from Cloudinary
    if (post.video?.public_id) {
      const result = await cloudinary.uploader.destroy(post.video.public_id ,{resource_type:"video"
    });
    if (result.result != 'ok') {
      return next(new ErrorClass("Error with deleting the video" , StatusCodes.NOT_FOUND));
       }
    } 
    // Delete the post
    const deletedPost = await post.deleteOne({postId});

    return res.status(StatusCodes.ACCEPTED).json({ message: "Post deleted successfully" ,deletedPost});
} 


// Get all posts with their comments
export const getAllPosts = async (req, res, next) => {
  const { userId } = req.params;
  const isUser = await userModel.findById(userId)
  if (!isUser) {
    return next(new ErrorClass(`User not found`));
  }
  if (isUser.isDeleted) {
    return next(new ErrorClass("you can't get posts please login to activate your account",StatusCodes.NOT_ACCEPTABLE))
  }
  // Find all posts in the database
  const mongooseQuery =  postsModel.find({privacy:'public',isDeleted:false}).populate('comments');
  const api = new ApiFeatures(mongooseQuery,req.query).pagination(postsModel).search().sort().filter().select()
  const posts = await api.mongooseQuery


  return res.status(StatusCodes.ACCEPTED).json({ message: "done" ,
  posts,
  totalPages: api.queryData.totalPages ,
  nextPage:api.queryData.nextPage,
  currentPage:api.queryData.page,
  previousPage:api.queryData.previousPage,
  modelCounts:api.queryData.modelCounts,
});
} 

// Get a post by ID
export const getPostById = async (req, res, next) => {
  const { postId } = req.params;
    // Find the post in the database
    const post= await postsModel.find({postId ,privacy:'public',isDeleted:false})
    if (!post) {
      return next(new ErrorClass(`post not found`,StatusCodes.NOT_FOUND));
    }
    return res.status(StatusCodes.ACCEPTED).json({ message: "done" ,
    post,
    });
} 

// Like a post
export const likePost = async (req, res, next) => {
  const { postId } = req.params;
    // Find the post in the database
    const post = await postsModel.findById(postId)
    if (!post) {
      return next(new ErrorClass(`post not found`,StatusCodes.NOT_FOUND));
    }

    // Check if the user has already liked the post
    if (post.likes.includes(req.user._id)) {
      return next(new ErrorClass(`User has already liked the post`,StatusCodes.BAD_REQUEST));
v    }

    // Add the user's ID to the post's likes array
    post.likes.push(req.user._id);

    // Save the updated post
    await post.save();

    return res.status(StatusCodes.ACCEPTED).json({ message: "Post liked successfully" ,post});
} 

// Unlike a post
export const unLikePost = async (req, res, next) => {
  const { postId } = req.params;
  // Find the post in the database
  const post = await postsModel.findById(postId)
  if (!post) {
    return next(new ErrorClass(`post not found`,StatusCodes.NOT_FOUND));
  }

    // Check if the user has liked the post
    if (!post.likes.includes(req.user._id)) {
      return next(new ErrorClass(`User has not liked the post before`,StatusCodes.BAD_REQUEST));
    }
    // Remove the user's ID from the post's likes array
    post.likes.pull(req.user._id);

    // Save the updated post
    await post.save();

    return res.status(StatusCodes.ACCEPTED).json({ message: "Post un liked successfully" ,post});
} 

// Update post privacy
export const updatePostPrivacy = async (req, res, next) => {
  const { postId } = req.params;
    // Find the post in the database
    const post = await postsModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
     // check if who wantto update post privacy is post owner 
    if (post.createdBy.toString() != req.user._id.toString()) {
      return res.status(StatusCodes.NOT_ACCEPTABLE).json({ message: 'you cannot update this post privacy' });
    }
    // Update the post's privacy setting
    post.privacy=req.body.privacy;
    // Save the updated post
    await post.save();
    return res.status(StatusCodes.ACCEPTED).json({ message: "Post privacy updated successfully", post });
} 

// Get posts created yesterday
export const getPostsCreatedYesterday = async (req, res, next) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // initialize start time for yesterday
  yesterday.setHours(0, 0, 0, 0);

  //  end time for yesterday
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setDate(yesterday.getDate() + 1);

    // Find posts created yesterday
    const mongooseQuery =  postsModel.find({
      createdAt: { $gte: yesterday, $lt: endOfYesterday },
      privacy:'public',
      isDeleted:false
    });
    const api = new ApiFeatures(mongooseQuery,req.query).pagination(postsModel).search().sort().filter().select()
    const posts = await api.mongooseQuery

    return res.status(StatusCodes.ACCEPTED).json({ message: "done",
    posts ,
    totalPages: api.queryData.totalPages ,
    nextPage:api.queryData.nextPage,
    currentPage:api.queryData.page,
    previousPage:api.queryData.previousPage,
    modelCounts:api.queryData.modelCounts,
  });
} 

// Get posts created today
export const getPostsCreatedToday = async (req, res, next) => {
  const today = new Date();

  // Find posts created today
  const mongooseQuery = postsModel.find({
    createdAt: { $gte: today.setHours(0, 0, 0, 0), $lt: new Date() },
    privacy:'public',
    isDeleted:false
  });
  const api = new ApiFeatures(mongooseQuery, req.query).pagination(postsModel).search().sort().filter().select();
  const posts = await api.mongooseQuery;

  return res.status(StatusCodes.ACCEPTED).json({
    message: "done",
    posts,
    totalPages: api.queryData.totalPages,
    nextPage: api.queryData.nextPage,
    currentPage: api.queryData.page,
    previousPage: api.queryData.previousPage,
    modelCounts: api.queryData.modelCounts,
  });
};

// Soft Delete a post
export const softDelete = async (req, res, next) => {
  const { postId } = req.params;
    // Find the post in the database
    const post = await postsModel.findById(postId);
    if (!post) {
      return next(new Error("post not found", StatusCodes.NOT_FOUND))
    }
     // check if who wantto update post privacy is post owner 
     if (post.createdBy.toString() != req.user._id.toString()) {
      return next(new Error("you cannot delete this post", StatusCodes.BAD_REQUEST))
    }
  if (post.isDeleted) {
    return next(new Error("this post is already soft deleted", { cause: 404 })
    );
  }
  const deletedPost = await post.updateOne(
    { isDeleted: true }
  );
  return res.status(StatusCodes.ACCEPTED).json({ message: "Post Soft Deleted Sucessfully", deletedPost });
};


