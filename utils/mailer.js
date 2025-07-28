import nodemailer from 'nodemailer';

export const sendEmail = async(to, subject, text) =>{
    try {
        const transporrter = nodemailer.createTransport({
            host : process.env.MAILTRAP_SMTP_HOST,
            port: process.env.MAILTRAP_SMTP_PORT,
            secure: false,
            auth:{
                user: process.env.MAILTRAP_SMTP_USER,
                pass: process.env.MAILTRAP_SMTP_PASS,
            },
        });

        const info = await transporrter.sendMail({
            from:`AI Ticket Assistant ${process.env.MAILTRAP_SMTP_USER}`,
            to,
            subject,
            text,   
        });
        console.log("Message sent:", info.messageId);
        return info
        
    } catch (error) {
        console.error("Error sending the email:", error)
        throw error
    }
}