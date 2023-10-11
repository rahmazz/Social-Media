import multer from 'multer'

export const fileValidation = {
    image: ['image/jpeg' , 'image/png' , 'image/gif' , 'image/jpg'],
    file: [ 'application/pdf' , 'application/msword'],
    video: ['video/mkv', 'video/gif', 'video/wmv', 'video/mp4'],
}

export function fileUpload(customValidation = []){

    const storage = multer.diskStorage({})
    function fileFilter(req,file,cb){
        if (customValidation.includes(file.mimetype)) {
            return cb(null, true)
        }else{
            return cb(new Error("In-Valid File Format"), false)
        }
    }
    const upload = multer({ fileFilter, storage })
    return upload
}




