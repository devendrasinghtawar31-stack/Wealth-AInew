import { useState } from "react";
import API from "../config/api"

export const useRazorpay = () => {
    const [loading, setLoading] = useState(false);

    const initiatePayment = async (user) => {
        setLoading(true);
        try {
            // 👇 Yahan ab token manually nikalne ki zaroorat nahi, API interceptor khud kar lega!
            const response = await API.post('/payments/create-order', { 
                amount: 1, 
                userId: user._id 
            });

            const data = response.data; // Axios response me .data lagana padta hai
            console.log("Backend Response:", data);
            
            // 👇 Yahan check kar backend kya bhej raha hai (orderId ya order_id)
            // Maine dono option daal diye hain safety ke liye:
            const razorpayOrderId = data.orderId || data.order_id;
            
            if (!razorpayOrderId) {
                throw new Error("Order ID nahi mila! Backend check karo.");
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: 100,
                currency: "INR",
                name: "Wealth AI",
                description: "Elite Membership",
                order_id: razorpayOrderId, // Sahi variable yahan pass kiya

                //main payment verifition with backend
        handler: async function (response) {
        try {
            console.log("Razorpay Success Response:", response); // Console me dekhne ke liye

            // Apne backend ke verify route par Razorpay ka data bhej rahe hain
            const verifyRes = await API.post('/payments/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
            });

            // Agar backend se success true aaya
            if (verifyRes.data.success) {
                alert(verifyRes.data.message); // Backend wala "mubarak ho bhai..." msg print hoga
                
                // Page ko turant reload kar dete hain taaki user ka naya Premium status dikh jaye
                window.location.reload(); 
            }
        } catch (error) {
            console.error("Payment Verification Error:", error);
            alert("Payment kat gayi hai, par verify karne me dikkat aayi. Admin se contact karein.");
        }
    },
    prefill: {
        name: user.name,
        email: user.email,
                },
                theme: { color: "#2ec4b6" }
            };

    

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Payment error:", err);
            // Agar backend se error aayi hai toh Axios err.response.data bhejta hai
            const errorMsg = err.response?.data?.message || err.message;
            alert("Payment failed: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return { initiatePayment, loading };
};