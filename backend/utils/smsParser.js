import crypto from 'crypto';

const parseSMS = (smsText) => {
    if (!smsText) {
        return { ignore: true };
    }

    const text = smsText.toLowerCase();

    // 1. Security Check: Bank SMS hai ya nahi?
    const isBankSMS = /a\/c|acct|account|vpa|upi|card|debited|credited|balance|bal|txn/i.test(text);
    if (!isBankSMS) {
        console.log("--> Security block: Normal chat SMS!");
        return { ignore: true };
    }

    // Default values
    let amount = 0;
    let type = 'pending';
    let merchant = 'Unknown';
    let category = 'Other';
    let title = 'SMS Transaction';

    // 2. Amount Extraction
    let cleanText = text.includes('balance') || text.includes('bal') ? text.split(/balance|bal/)[0] : text;
    const amountRegex = /(?:rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/;
    const amountMatch = cleanText.match(amountRegex);
    if (amountMatch) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // 3. Type Detection
    if (text.includes('credited') || text.includes('received') || text.includes('deposited')) {
        type = 'income';
    } else if (text.includes('debited') || text.includes('spent') || text.includes('paid')) {
        type = 'expense';
    }

    // 4. Merchant & Category Mapping (Better Mapping)
    if (text.includes('zomato') || text.includes('swiggy')) {
        merchant = 'Food'; category = 'Food & Dining';
    } else if (text.includes('uber') || text.includes('ola')) {
        merchant = 'Travel'; category = 'Transportation';
    } else if (text.includes('amazon') || text.includes('flipcart') || text.includes('myntra')) {
        merchant = 'Shopping'; category = 'Shopping';
    } else if (text.includes('netflix') || text.includes('spotify') || text.includes('prime')) {
        merchant = 'Subscription'; category = 'Entertainment';
    } else if (text.includes('blinkit') || text.includes('zepto') || text.includes('instamart')) {
        merchant = 'Grocery Store'; category = 'Groceries';
    } else if (text.includes('salary') || text.includes('stipend')) {
        merchant = 'Employer'; category = 'Salary';
    } else if (text.includes('medical') || text.includes('pharmacy') || text.includes('apollo')) {
        merchant = 'Medical Care'; category = 'Health';
    }

    // 5. Title Generation
    if (type === 'income') {
        title = merchant !== 'Unknown' ? `Received from ${merchant}` : 'Money Received';
    } else if (type === 'expense') {
        title = merchant !== 'Unknown' ? `Paid to ${merchant}` : 'Money Spent';
    }

    // Final Validation
    if (amount === 0 || type === 'pending') {
        return { ignore: true };
    }

    return {
        amount,
        type,
        merchant,
        category, // Yeh ab sahi se pass hoga
        title,
        smsHash: crypto.createHash('md5').update(smsText.trim()).digest('hex'),
        ignore: false
    };
};

export default parseSMS;