import jwt  from "jsonwebtoken";



export const generateToken = ({ payload = {} , signature = process.env.TOKEN_SIGNITURE , expiresIn = 60 * 60 *60*365 } = {})=>{
    const token = jwt.sign(payload , signature , { expiresIn :parseInt(expiresIn) });
    return token 
}

export const verifyToken = ({ token , signature = process.env.TOKEN_SIGNITURE} = {}) =>{
    const decoded = jwt.verify(token , signature);
    return decoded  
}
