const nodeMailer = require('nodemailer')

exports.sendEmail = async(options)=>{

    try{
        var transporter =  nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth:{
                user:process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
        });
    
        const emailOptions={
            from: process.env.SMTP_EMAIL,
            to: options.email,
            subject: options.subject,
            text: options.message,
        }
    
        await transporter.sendMail(emailOptions);
    }catch(error){
        console.log(`Send email ${error.message}`);
        return;
    }
    
}