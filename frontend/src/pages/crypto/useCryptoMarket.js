import { useState, useEffect } from "react";
import { cryptoService } from "./cryptoService";

export const useCryptoMarket = (walletCoins, setWalletCoins) => {
    //  CORE MARKET & PORTFOLIO STATES
    const [prices, setPrices] = useState({ bitcoin: 5420500, ethereum: 310200, solana: 12450 });
    const [priceTrend, setPriceTrend] = useState({ BTC: "up", ETH: "up", SOL: "up" });
    const [loading, setLoading] = useState(true);
    
    const [portfolio, setPortfolio] = useState([]); // Backend array return karta hai
    const [fetchingPortfolio, setFetchingPortfolio] = useState(false);

    // TRADING TERMINAL STATES
    const [selectedAsset, setSelectedAsset] = useState("BTC"); 
    const [tradeType, setTradeType] = useState("BUY");
    const [tradeAmount, setTradeAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0); // 15s Idempotency Timer
    const [terminalMessage, setTerminalMessage] = useState({ type: "", text: "" });

    //  15-SECOND IDEMPOTENCY COOLDOWN ENGINE
    useEffect(() => {
        if (cooldownTime <= 0) return;
        const timer = setInterval(() => {
            setCooldownTime(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldownTime]);

    //  REAL-TIME LIVE TICKER SIMULATION ENGINE
    useEffect(() => {
        const liveTickerInterval = setInterval(() => {
            setPrices(prev => {
                const btcChange = (Math.random() - 0.49) * 2000;
                const ethChange = (Math.random() - 0.49) * 150;
                const solChange = (Math.random() - 0.49) * 10;

                setPriceTrend({
                    BTC: btcChange >= 0 ? "up" : "down",
                    ETH: ethChange >= 0 ? "up" : "down",
                    SOL: solChange >= 0 ? "up" : "down"
                });

                return {
                    bitcoin: Math.max(5000000, Math.round(prev.bitcoin + btcChange)),
                    ethereum: Math.max(250000, Math.round(prev.ethereum + ethChange)),
                    solana: Math.max(10000, Math.round(prev.solana + solChange))
                };
            });
        }, 3000);

        return () => clearInterval(liveTickerInterval);
    }, []);

    //  FETCH PORTFOLIO INTEGRATION
    const loadPortfolioData = async () => {
        try {
            setFetchingPortfolio(true);
            const data = await cryptoService.getUserPortfolio();
            
            if (data && data.portfolio) {
                console.log("=== BACKEND PORTFOLIO DATA CHECKS ===", data.portfolio);
                setPortfolio(data.portfolio);
                if (data.summary && data.summary.walletBalance !== undefined) {
                    //  Initial data load par hi 2 decimals maximum lock kiya
                    const cleanBalance = parseFloat(Number(data.summary.walletBalance).toFixed(2));
                    setWalletCoins(cleanBalance); 
                }
            } else if (data) {
                setPortfolio(data);
            }
            setLoading(false);
            setFetchingPortfolio(false);
        } catch (err) {
            console.error("Portfolio fetch pipeline broke down", err);
            setPortfolio([]);
            setLoading(false);
            setFetchingPortfolio(false);
        }
    };

    // Trigger initial load on hook mounting
    useEffect(() => {
        loadPortfolioData();
    }, []);

    //  INTERACTIVE ORDER EXECUTION HANDLER
    const handleTradeExecution = async (e) => {
        e.preventDefault();
        setTerminalMessage({ type: "", text: "" });

        const numericAmount = parseFloat(tradeAmount);
        if (!numericAmount || numericAmount <= 0) {
            setTerminalMessage({ type: "error", text: "Bhai, valid coin amount toh enter karo!" });
            return;
        }

        if (tradeType === "BUY" && numericAmount > walletCoins) {
            setTerminalMessage({ type: "error", text: "Insolvency Alert! Wallet me पर्याप्त balance nahi hai." });
            return;
        }

        try {
            setIsSubmitting(true);
            
            let ticker = selectedAsset.toUpperCase();
            if (ticker === "BITCOIN") ticker = "BTC";
            if (ticker === "ETHEREUM") ticker = "ETH";
            if (ticker === "SOLANA") ticker = "SOL";

            let backendResponse;

            if (tradeType === "BUY") {
                backendResponse = await cryptoService.executeBuyOrder(ticker, numericAmount);
                
                if (backendResponse && backendResponse.walletBalanceLeft !== undefined) {
                    //  Response aane par float decimals ko wrap kiya
                    setWalletCoins(parseFloat(Number(backendResponse.walletBalanceLeft).toFixed(2)));
                } else {
                    // Local fallback operation state lock 
                    setWalletCoins(prev => parseFloat((prev - numericAmount).toFixed(2)));
                }
            } else {
                // SELL OPERATION MATHEMATICS
                const currentAssetKey = selectedAsset.toLowerCase() === "btc" ? "bitcoin" : selectedAsset.toLowerCase();
                const currentLiveRateOfAsset = prices[currentAssetKey]; 

                if (!currentLiveRateOfAsset) {
                    setTerminalMessage({ type: "error", text: "Rate sync error! Thoda thahro bhai." });
                    setIsSubmitting(false);
                    return;
                }

                // Formula: Quantity = Coins to Withdraw / Live Rate of 1 Crypto Unit
                const quantityToBackend = numericAmount / currentLiveRateOfAsset;

                console.log(`Sending real fractional quantity to backend: ${quantityToBackend}`);

                backendResponse = await cryptoService.executeSellOrder(ticker, quantityToBackend);
                
                if (backendResponse && backendResponse.walletBalanceNow !== undefined) {
                    //  Response balance ko 2 decimal space par clean up kiya
                    setWalletCoins(parseFloat(Number(backendResponse.walletBalanceNow).toFixed(2)));
                } else {
                    //  Local state math operations bug guard
                    setWalletCoins(prev => parseFloat((prev + numericAmount).toFixed(2)));
                }
            }

            // Sync successfully, lock terminal for 15 seconds matching backend middleware
            setCooldownTime(15);
            setTradeAmount("");
            
            setTerminalMessage({ 
                type: "success", 
                text: backendResponse?.message || `Order Executed! ${tradeType === "BUY" ? "Bought" : "Sold"} operation process finalized safely.` 
            });
            setIsSubmitting(false);
            
            // Re-fetch database counts to ensure strict alignment of calculations
            loadPortfolioData();

        } catch (err) {
            setTerminalMessage({ 
                type: "error", 
                text: err.response?.data?.message || "Transaction Matrix Failed! Idempotency conflict token might be expired." 
            });
            setIsSubmitting(false);
        }
    };

    // Return all properties required by the view node
    return {
        prices,
        priceTrend,
        loading,
        portfolio,
        fetchingPortfolio,
        selectedAsset,
        setSelectedAsset,
        tradeType,
        setTradeType,
        tradeAmount,
        setTradeAmount,
        isSubmitting,
        cooldownTime,
        terminalMessage,
        handleTradeExecution
    };
};