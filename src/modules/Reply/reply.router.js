import { Router } from "express";
import * as commentController from "./controller/reply.js";
import { asyncHandeller } from "../../utils/errorHandeling.js";
import { auth } from "../../middleWare/authontication.js";
import { endPoint } from "./reply.endPoint.js";
import { validation } from "../../middleWare/validation.js";
import * as validatores from "./validation.js";
const router=Router()

router.post(`/addReply`,
validation(validatores.headers,true),
auth(endPoint.replyCrud),
validation(validatores.addReply),
asyncHandeller(commentController.addReply))


router.patch(`/:replyId`,
validation(validatores.headers,true),
auth(endPoint.replyCrud),
validation(validatores.updatedReply),
asyncHandeller(commentController.updateReply))

router.delete(`/:replyId`,
validation(validatores.headers,true),
auth(endPoint.replyCrud),
validation(validatores.deleteReply),
asyncHandeller(commentController.deleteReply))


router.patch(`/likeReply/:replyId`,
validation(validatores.headers,true),
auth(endPoint.replyCrud),
validation(validatores.likeReply),
asyncHandeller(commentController.likeReply))


router.patch(`/unLikeReply/:replyId`,
validation(validatores.headers,true),
auth(endPoint.replyCrud),
validation(validatores.unLikeReply),
asyncHandeller(commentController.unLikeReply))


export default router