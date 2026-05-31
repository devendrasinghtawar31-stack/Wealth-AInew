import twilio from 'twilio';

const sendSMS = async (options) => { 

    const client = twilio(process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
    //ye line sms bhejegi
    await client.messages.create({
        body: options.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to:options.phone
    })
}

export default sendSMS;