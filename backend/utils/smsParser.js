import crypto from 'crypto';

const parseSMS = (smsText) => {

    if (!smsText) { 
        return {amount:0 , type:'pending', merchant:'Unkown', category: 'Other',title:'SMS Transaction' ,smsHash: ''}
    }
    //lowercase mein badla taaki check karna aasan rahe
    const text = smsText.toLowerCase();

    //default values set karna hai

    let amount = 0;
    let type = 'pending';
    let merchant = 'Unknown';
    let category = 'Other';
    let title = 'SMS Transaction'

    //har sms ka 32-words ka hash 
    const smsHash = crypto.createHash('md5').update(smsText.trim()).digest('hex');

    //security check


    const isBankSMS =
        text.includes('a/c') ||
        text.includes('acct') ||
        text.includes('account') ||
        text.includes('vpa') ||
        text.includes('upi') ||
        text.includes('card') ;
    
    if (!isBankSMS) { 
        console.log("--> security block : fake ya normal chat SMS paksa gaya!")
        return { amount: 0, type, merchant, category, title ,smsHash };
    }

    //amount nikalne ke liye regex(rs.ya INR ke baad ka number)

    let cleanText = text;
    if (text.includes('balance') || text.includes('bal')) {
        // Ye string ko "balance" se do tukdo mein baant dega, aur hum pehla [0] wala tukda utha lenge
        cleanText = text.split(/balance|bal/)[0];
    }

    const amountRegex = /(?:rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/;
    const amountMatch = cleanText.match(amountRegex)

    if (amountMatch) {
        //coma(,)hatake number mein convert
        amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

        //type check karna (credit ya debit)

        if (text.includes('credited') || text.includes('received') || text.includes('deposited')) {
            type = 'income';
        } else if (text.includes('debited') || text.includes('spent') || text.includes('paid')) {
            type = 'expense';
        }

        //  Merchant(dukan/app) ka naam nikalna
        if (text.includes('zomato') || text.includes('swiggy')) {
            merchant = 'Food';
        } else if (text.includes('uber') || text.includes('ola')) {
            merchant = 'Travel'
        }else if (text.includes('amazon') || text.includes('flipcart')) {
            merchant = 'Shopping';
        }else if (text.includes('netflix') || text.includes('spotify')) {
            merchant = 'Subscription';
        }else if (text.includes('blinkit') || text.includes('zepto')) {
        merchant = 'Groceries Store'; category = 'Groceries';
    } else if (text.includes('salary') || text.includes('stipend')) {
        merchant = 'Salary Source'; category = 'Salary';
    } else if (text.includes('medical') || text.includes('pharmacy')) {
        merchant = 'Medical Care'; category = 'Health';
    }
        

    if (type === 'income') {
        title = merchant !== 'Unknown' ? `Recieved from ${merchant}` : 'money recieved'
    } else if (type === 'expense') {
        title = merchant !== 'Unknown' ? `Paid to ${merchant}` : 'money spent'
     }


    return {amount , type , merchant , category , title , smsHash}
    
}




export default parseSMS;

