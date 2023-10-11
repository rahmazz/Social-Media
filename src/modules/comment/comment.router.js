import { Router } from "express";
import * as commentController from "./controller/comment.js";
import { asyncHandeller } from "../../utils/errorHandeling.js";
import { auth } from "../../middleWare/authontication.js";
import { endPoint } from "./comment.endPoint.js";
import { validation } from "../../middleWare/validation.js";
import * as validatores from "./validation.js";
const router=Router()

router.post(`/addComment`,
validation(validatores.headers,true),
auth(endPoint.commentCrud),
validation(validatores.addComment),
asyncHandeller(commentController.addComment))


router.patch(`/:commentId`,
validation(validatores.headers,true),
auth(endPoint.commentCrud),
validation(validatores.updateComment),
asyncHandeller(commentController.updateComment))

router.delete(`/:commentId`,
validation(validatores.headers,true),
auth(endPoint.commentCrud),
validation(validatores.deleteComment),
asyncHandeller(commentController.deleteComment))


router.patch(`/likeComment/:commentId`,
validation(validatores.headers,true),
auth(endPoint.commentCrud),
validation(validatores.likeComment),
asyncHandeller(commentController.likeComment))


router.patch(`/unLikeComment/:commentId`,
validation(validatores.headers,true),
auth(endPoint.commentCrud),
validation(validatores.unLikeComment),
asyncHandeller(commentController.unLikeComment))


export default router