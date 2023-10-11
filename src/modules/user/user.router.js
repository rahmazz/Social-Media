import { Router } from "express";
import* as userController from "./controller/user.js"
import { validation } from "../../middleWare/validation.js";
import * as validatores from "./validation.js";
import { fileUpload, fileValidation } from "../../utils/multer.cloud.js";
import { asyncHandeller } from "../../utils/errorHandeling.js";
import { auth } from "../../middleWare/authontication.js";
import { endPoint } from "./user.endPoint.js";


const  router = Router()

router.get(`/get-user-profile`,
validation(validatores.getUserProfile),
asyncHandeller(userController.getUserProfile))


router.patch(`/updateProfile`,
validation(validatores.headers,true),
auth(endPoint.userCrud),
fileUpload(fileValidation.image).single('profileImage'),
validation(validatores.updateProfile),
asyncHandeller(userController.updateProfile))


router.post(`/add-profile-picture`,
validation(validatores.headers,true),
auth(endPoint.userCrud),
fileUpload(fileValidation.image).single('profileImage'),
validation(validatores.addProfilePicture),
asyncHandeller(userController.addProfilePicture))


router.patch(`/add-cover-picture`,
validation(validatores.headers,true),
auth(endPoint.userCrud),
fileUpload(fileValidation.image).array('coverImages'),
validation(validatores.addCoverPicture),
asyncHandeller(userController.addCoverPicture))


router.patch(`/add-video`,
validation(validatores.headers,true),
auth(endPoint.userCrud),
fileUpload(fileValidation.video).single('video'),
validation(validatores.addVideo),
asyncHandeller(userController.addVideo))

router.put(`/updatePassword`,
validation(validatores.headers,true),
auth(endPoint.userCrud),
validation(validatores.updatePassword),
asyncHandeller(userController.updatePassword))


router.put(`/softdelete`,
validation(validatores.headers,true),
auth(endPoint.userCrud),
asyncHandeller(userController.softDelete))


export default router