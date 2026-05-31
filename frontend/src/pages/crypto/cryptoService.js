// cryptoService.js
import API from "../../config/api.js"; // Apne directory architecture ke hisab se sahi path check kar lena

/**
 *  Integration Engine
 * Keys sync ho gayi hain backend data schema { cryptoName, coinsToInvest, quantityToSell } ke sath.
 */
export const cryptoService = {
    // 1. Fetch User Current Portfolio Holdings
    getUserPortfolio: async () => {
        const response = await API.get("/crypto/portfolio"); 
        return response.data; 
    },

    // 2. Execute Buy Operations (FIXED KEYS)
    executeBuyOrder: async (asset, amount) => {
        //  Backend expecting: cryptoName aur coinsToInvest
        const response = await API.post("/crypto/buy", { 
            cryptoName: asset,       // e.g., 'BTC', 'ETH'
            coinsToInvest: amount    // e.g., 5000
        });
        return response.data;
    },

    // 3. Execute Sell Operations (FIXED KEYS)
    executeSellOrder: async (asset, quantity) => {
        //  Backend expecting: cryptoName aur quantityToSell
        const response = await API.post("/crypto/sell", { 
            cryptoName: asset, 
            quantityToSell: quantity 
        });
        return response.data;
    }
};