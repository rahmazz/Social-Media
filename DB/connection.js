import mongoose from "mongoose";


const DBconnection = async() =>{
    return await mongoose.connect(process.env.DB_URL).then (result =>{
        console.log(`conectedDB.....`);
    }).catch(err=>{
        console.log(`catch error....${err}`);
    })
}


export default DBconnection