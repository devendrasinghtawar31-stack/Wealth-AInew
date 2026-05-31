import { text } from 'express';
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {

    //transporter hai ye jo (postman jo mail leke jaega)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const message = {

        from: 'WealthAI <${process.env.SMTP_USER}>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,

    }
   
    await transporter.sendMail(message);

};

export default sendEmail;