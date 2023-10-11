import { Router } from "express";
import* as authController from "./controller/auth.js"
import { validation } from "../../middleWare/validation.js";
import * as validatores from "./validation.js"
import { asyncHandeller } from "../../utils/errorHandeling.js";

const  router = Router()

router.post(`/signup`,
validation(validatores.signup),
asyncHandeller(authController.signUp))

router.patch(`/confirmEmail`,
validation(validatores.confirmemail),
asyncHandeller(authController.confirmEmail))

router.post(`/signin`,
validation(validatores.signIn),
asyncHandeller(authController.signIn)) 

router.post(`/refreshToken/:token`,
validation(validatores.refreshToken),
asyncHandeller(authController.refreshToken))

router.patch(`/sendChangePasswordCode`,
validation(validatores.sendChangePasswordCode),
asyncHandeller(authController.sendChangePasswordCode))

router.patch(`/resetPassword`,
validation(validatores.resetPassword),
asyncHandeller(authController.resetPassword))



export default router