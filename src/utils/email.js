import nodemailer from "nodemailer";
const sendEmail = async( { from = process.env.EMAIL , to , cc , bcc , subject ,text , html , attachments = [] } = {} ) =>{
    const transporter = nodemailer.createTransport({
        service:"gmail",
        secure:true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
      },
    });

    const emailInfo = await transporter.sendMail({
        from: `"Rahma Foo 👻" <${from}>`, 
        to, 
        cc, 
        bcc,
        subject,
        text,   
        html,  
        attachments
      });
    return  emailInfo.accepted.length < 1 ? false : true
    
}

export default sendEmail




