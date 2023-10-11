import DBconnection from "../DB/connection.js"
import authRouter from "./modules/auth/auth.router.js"
import userRouter from "./modules/user/user.router.js"
import postRouter from "./modules/post/post.router.js"
import commentRouter from "./modules/comment/comment.router.js"
import replyRouter from "./modules/Reply/reply.router.js"
import { globalErrorHandelling } from "./utils/errorHandeling.js"


const bootstrap = (app,express) =>{
    app.use(express.json());


    app.use(`/auth`,authRouter)
    app.use(`/user`,userRouter)
    app.use(`/post`,postRouter)
    app.use(`/comment`,commentRouter)
    app.use(`/reply`,replyRouter)
   
    app.all(`*`,(req,res,next)=>{
        res.json({message:"In-Valid routing"})
    })
    app.use(globalErrorHandelling)
    DBconnection()
}

export default bootstrap