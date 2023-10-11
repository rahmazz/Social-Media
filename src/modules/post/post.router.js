import { Router } from "express";
import * as postController from "./controller/post.js";
import { asyncHandeller } from "../../utils/errorHandeling.js";
import { auth } from "../../middleWare/authontication.js";
import { endPoint } from "./post.endPoint.js";
import { fileUpload, fileValidation } from "../../utils/multer.cloud.js";
import { validation } from "../../middleWare/validation.js";
import * as validatores from "./validation.js";
const router=Router()

router.post(`/addPost`,
validation(validatores.headers,true),
auth(endPoint.postCrud),
fileUpload([...fileValidation.image,...fileValidation.video]).fields([
    { name : 'image', maxCount: 1 },
    { name : 'video' , maxCount: 1 }
]),
validation(validatores.addPost),
asyncHandeller(postController.addPost))


router.patch(`/:postId`,
validation(validatores.headers,true),
auth(endPoint.postCrud),
fileUpload([...fileValidation.image,...fileValidation.video]).fields([
    { name : 'image', maxCount: 1 },
    { name : 'video' , maxCount: 1 }
]),
validation(validatores.updatePost),
asyncHandeller(postController.updatePost))


router.get(`/getAllPosts/:userId`,
validation(validatores.getAllPosts),
asyncHandeller(postController.getAllPosts))

router.get(`/getPostById/:postId`,
validation(validatores.getPostById),
asyncHandeller(postController.getPostById))


router.delete(`/:postId`,
validation(validatores.headers,true),
auth(endPoint.postCrud),
validation(validatores.deletePost),
asyncHandeller(postController.deletePost))

router.patch(`/likePost/:postId`,
validation(validatores.headers,true),
auth(endPoint.postCrud),
validation(validatores.likePost),
asyncHandeller(postController.likePost))


router.patch(`/unLikePost/:postId`,
validation(validatores.headers,true),
auth(endPoint.postCrud),
validation(validatores.unLikePost),
asyncHandeller(postController.unLikePost))

router.put(`/:postId`,
validation(validatores.headers,true),
auth(endPoint.postCrud),
validation(validatores.updatePostPrivacy),
asyncHandeller(postController.updatePostPrivacy))

router.put(`/softDelete/:postId`,
validation(validatores.headers,true),
auth(endPoint.postCrud),
validation(validatores.softDelete),
asyncHandeller(postController.softDelete))

router.get(`/getPostsCreatedYesterday`,
asyncHandeller((postController.getPostsCreatedYesterday)))

router.get(`/getPostsCreatedToday`,
asyncHandeller((postController.getPostsCreatedToday)))


export default router