import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { theme } from "../../theme";
import { injectCryptoStyles } from "./cryptoStyles";
import { useCryptoMarket } from "./useCryptoMarket";

const CryptoMarket = () => {
    //  Layout context se wallet attributes nikaale
    const { walletCoins = 0, setWalletCoins = () => {} } = useOutletContext() || {};
    
    //  Bind the Senior Logic Layer Custom Hook
    const {
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
    } = useCryptoMarket(walletCoins, setWalletCoins);

    //  Inject cleanly separated CSS keyframes on component mount
    useEffect(() => {
        injectCryptoStyles();
    }, []);

    //  MULTI-KEY BACKEND SYNC LAYER
const getAssetData = (ticker) => {
    if (!portfolio || !Array.isArray(portfolio)) return { quantity: 0, avgPrice: 0 };
    
    const asset = portfolio.find(item => item.cryptoName?.toUpperCase() === ticker.toUpperCase());
    
    return {
        quantity: asset ? parseFloat(asset.quantity || 0) : 0,
        
        //  Sabhi possible backend nomenclature keys ko match karega:
        avgPrice: asset ? parseFloat(
            asset.avgPrice || 
            asset.averagePrice || 
            asset.buyPrice || 
            asset.avgBuyPrice || 
            asset.averageBuyPrice || 
            asset.purchasePrice || 
            0
        ) : 0
    };
};

    // Safe dynamic state extraction
    const { quantity: btcQty, avgPrice: btcAvg } = getAssetData("BTC");
    const { quantity: ethQty, avgPrice: ethAvg } = getAssetData("ETH");
    const { quantity: solQty, avgPrice: solAvg } = getAssetData("SOL");

    // Live Value Computations
    const btcValue = btcQty * (prices?.bitcoin || 0);
    const ethValue = ethQty * (prices?.ethereum || 0);
    const solValue = solQty * (prices?.solana || 0);
    const totalNetWorth = Math.round(btcValue + ethValue + solValue);

    // Profit & Loss Engine Checker
    const calculatePnL = (currentPrice, avgPrice) => {
        if (!avgPrice || avgPrice === 0) return { text: "0.00%", isPositive: true };
        const pnlPercent = ((currentPrice - avgPrice) / avgPrice) * 100;
        return {
            text: `${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%`,
            isPositive: pnlPercent >= 0
        };
    };

    const btcPnL = calculatePnL(prices?.bitcoin, btcAvg);
    const ethPnL = calculatePnL(prices?.ethereum, ethAvg);
    const solPnL = calculatePnL(prices?.solana, solAvg);

    // LOADING SCREEN
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', color: '#FFF', fontFamily: 'monospace' }}>
                <span>Connecting to Trading Infrastructure Pipelines...</span>
            </div>
        );
    }

    return (
        <div className="animate-page-matrix" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box' }}>
            
            {/* TOP BAR / BANNER CONTEXT SYNC */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#FAFAF9', letterSpacing: '-0.5px' }}>
                        Live Crypto Exchange Grid 🪙
                    </h1>
                    <p style={{ margin: '6px 0 0 0', color: theme.colors.textMuted || '#8A99AD', fontSize: '14px' }}>
                        Senior Architecture Node—Fully separated concerns (SoC) system active.
                    </p>
                </div>
               {/* WALLET SNAPSHOT DIRECTLY LINKED TO LAYOUT CONTEXT */}
<div style={{ background: '#1C232B', border: `1px solid ${theme.colors.border || '#2C353F'}`, padding: '12px 20px', borderRadius: '12px', textAlign: 'right' }}>
    <span style={{ fontSize: '11px', color: '#8A99AD', fontWeight: 'bold', display: 'block', letterSpacing: '0.5px' }}>ACTIVE LIQUIDITY BALANCE</span>
    <span style={{ fontSize: '20px', fontWeight: '800', color: '#2EC4B6' }}>
        {/*  Sirf is ek line me .toFixed(2) aur strict format dala hai */}
        ₹{Number(parseFloat(walletCoins || 0).toFixed(2)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: '12px', color: '#FFF' }}>Coins</span>
    </span>
</div>
            </div>

            {/* LIVE CRYPTO PRICE CARDS TICKER SYSTEM */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* BITCOIN */}
                <div className={`crypto-card-pulse ${priceTrend?.BTC === "up" ? "flash-up" : "flash-down"}`} style={{ background: theme.colors.surface || '#1C232B', border: '1px solid rgba(255, 153, 0, 0.15)', padding: '24px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFF' }}>🧡 Bitcoin <span style={{ color: '#8A99AD', fontSize: '12px' }}>BTC/INR</span></span>
                        <span style={{ color: priceTrend?.BTC === "up" ? '#2EC4B6' : '#FF6B35', fontSize: '12px', fontWeight: 'bold' }}>● LIVE PRICE</span>
                    </div>
                    <h2 style={{ fontSize: '34px', margin: '20px 0 0 0', color: '#FFF', fontWeight: '750' }}>₹{(prices?.bitcoin || 0).toLocaleString("en-IN")}</h2>
                </div>

                {/* ETHEREUM */}
                <div className={`crypto-card-pulse ${priceTrend?.ETH === "up" ? "flash-up" : "flash-down"}`} style={{ background: theme.colors.surface || '#1C232B', border: '1px solid rgba(141, 161, 252, 0.15)', padding: '24px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFF' }}>💙 Ethereum <span style={{ color: '#8A99AD', fontSize: '12px' }}>ETH/INR</span></span>
                        <span style={{ color: priceTrend?.ETH === "up" ? '#2EC4B6' : '#FF6B35', fontSize: '12px', fontWeight: 'bold' }}>● LIVE PRICE</span>
                    </div>
                    <h2 style={{ fontSize: '34px', margin: '20px 0 0 0', color: '#FFF', fontWeight: '750' }}>₹{(prices?.ethereum || 0).toLocaleString("en-IN")}</h2>
                </div>

                {/* SOLANA */}
                <div className={`crypto-card-pulse ${priceTrend?.SOL === "up" ? "flash-up" : "flash-down"}`} style={{ background: theme.colors.surface || '#1C232B', border: '1px solid rgba(20, 241, 149, 0.15)', padding: '24px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFF' }}>💚 Solana <span style={{ color: '#8A99AD', fontSize: '12px' }}>SOL/INR</span></span>
                        <span style={{ color: priceTrend?.SOL === "up" ? '#2EC4B6' : '#FF6B35', fontSize: '12px', fontWeight: 'bold' }}>● LIVE PRICE</span>
                    </div>
                    <h2 style={{ fontSize: '34px', margin: '20px 0 0 0', color: '#FFF', fontWeight: '750' }}>₹{(prices?.solana || 0).toLocaleString("en-IN")}</h2>
                </div>
            </div>

            {/* DUAL WORKSTATION DESK */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
                
                {/* 1. EXECUTION WORKSTATION FORM */}
                <div style={{ background: theme.colors.surface || '#1C232B', border: `1px solid ${theme.colors.border || '#2C353F'}`, padding: '30px', borderRadius: '16px' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#FFF', fontSize: '18px', fontWeight: '700' }}>⚡ Core Execution Terminal</h3>
                    
                    <form onSubmit={handleTradeExecution} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* TOGGLE OPERATION SWITCH */}
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
                            <button type="button" disabled={cooldownTime > 0} onClick={() => setTradeType("BUY")} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: tradeType === "BUY" ? '#2EC4B6' : 'transparent', color: tradeType === "BUY" ? '#000' : '#8A99AD', transition: 'all 0.2s', opacity: cooldownTime > 0 ? 0.5 : 1 }}>BUY</button>
                            <button type="button" disabled={cooldownTime > 0} onClick={() => setTradeType("SELL")} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: tradeType === "SELL" ? '#FF6B35' : 'transparent', color: tradeType === "SELL" ? '#FFF' : '#8A99AD', transition: 'all 0.2s', opacity: cooldownTime > 0 ? 0.5 : 1 }}>SELL</button>
                        </div>

                        {/* SELECT TARGET ASSET */}
                        <div>
                            <label style={{ display: 'block', color: '#8A99AD', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>TARGET TRADING ASSET NODE</label>
                            <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${theme.colors.border || '#2C353F'}`, color: '#FFF', borderRadius: '8px', outline: 'none', fontWeight: '600' }}>
                                <option value="BTC">Bitcoin (BTC)</option>
                                <option value="ETH">Ethereum (ETH)</option>
                                <option value="SOL">Solana (SOL)</option>
                            </select>
                        </div>

                        {/* AMOUNT SPECIFICATION COMPONENT */}
                        <div>
                            <label style={{ display: 'block', color: '#8A99AD', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>LIQUIDITY VOLUME REQUEST (INR VALUED COINS)</label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" placeholder="Enter amount to exchange..." value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} disabled={cooldownTime > 0 || isSubmitting} style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.25)', border: `1px solid ${theme.colors.border || '#2C353F'}`, color: '#FFF', borderRadius: '8px', fontSize: '15px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }} />
                                <span style={{ position: 'absolute', right: '16px', top: '14px', color: '#8A99AD', fontWeight: 'bold' }}>₹</span>
                            </div>
                        </div>

                        {/* STATUS MATRIX MESSAGING SCREEN */}
                        {terminalMessage?.text && (
                            <div style={{ padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', background: terminalMessage.type === "error" ? 'rgba(255,107,53,0.08)' : 'rgba(46,196,182,0.08)', color: terminalMessage.type === "error" ? '#FF6B35' : '#2EC4B6', border: `1px solid ${terminalMessage.type === "error" ? 'rgba(255,107,53,0.15)' : 'rgba(46,196,182,0.15)'}` }}>
                                {terminalMessage.text}
                            </div>
                        )}

                        {/* SUBMIT BUTTON */}
                        <button type="submit" disabled={isSubmitting || cooldownTime > 0} style={{ width: '100%', padding: '16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: (isSubmitting || cooldownTime > 0) ? 'not-allowed' : 'pointer', background: cooldownTime > 0 ? '#2C353F' : (tradeType === "BUY" ? '#2EC4B6' : '#FF6B35'), color: tradeType === "BUY" && cooldownTime === 0 ? '#000' : '#FFF', transition: 'all 0.2s' }}>
                            {isSubmitting ? "PROCESSING TRANSACTION..." : cooldownTime > 0 ? `ANTI-SPAM ACTIVE (${cooldownTime}s)` : `EXECUTE CORE ${tradeType} PIPELINE`}
                        </button>
                    </form>
                </div>

                {/* 2. USER CURRENT ASSET HOLDINGS */}
                <div style={{ background: theme.colors.surface || '#1C232B', border: `1px solid ${theme.colors.border || '#2C353F'}`, padding: '30px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ margin: '0 0 6px 0', color: '#FFF', fontSize: '18px', fontWeight: '700' }}>💼 Decentralized Holdings Weight</h3>
                        <p style={{ margin: '0 0 24px 0', color: '#8A99AD', fontSize: '13px' }}>Current network verified asset weight allocation structure.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: fetchingPortfolio ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                            {/* BTC ROW */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)', borderLeft: '4px solid #FF9900' }}>
                                <div>
                                    <strong style={{ color: '#FFF', display: 'block', fontSize: '14px' }}>Bitcoin</strong>
                                    <span style={{ color: '#8A99AD', fontSize: '12px', display: 'block' }}>{btcQty.toFixed(6)} BTC</span>
                                    <span style={{ color: '#5A6E85', fontSize: '11px' }}>Avg Buy: ₹{btcAvg.toLocaleString("en-IN")}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ color: '#FFF', fontWeight: '700', display: 'block' }}>₹{btcValue.toLocaleString("en-IN", {maximumFractionDigits: 0})}</span>
                                    <span style={{ color: btcPnL.isPositive ? '#2EC4B6' : '#FF6B35', fontSize: '11px', fontWeight: 'bold' }}>{btcPnL.text} PnL</span>
                                </div>
                            </div>

                            {/* ETH ROW */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)', borderLeft: '4px solid #8DA1FC' }}>
                                <div>
                                    <strong style={{ color: '#FFF', display: 'block', fontSize: '14px' }}>Ethereum</strong>
                                    <span style={{ color: '#8A99AD', fontSize: '12px', display: 'block' }}>{ethQty.toFixed(6)} ETH</span>
                                    <span style={{ color: '#5A6E85', fontSize: '11px' }}>Avg Buy: ₹{ethAvg.toLocaleString("en-IN")}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ color: '#FFF', fontWeight: '700', display: 'block' }}>₹{ethValue.toLocaleString("en-IN", {maximumFractionDigits: 0})}</span>
                                    <span style={{ color: ethPnL.isPositive ? '#2EC4B6' : '#FF6B35', fontSize: '11px', fontWeight: 'bold' }}>{ethPnL.text} PnL</span>
                                </div>
                            </div>

                            {/* SOL ROW */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)', borderLeft: '4px solid #14F195' }}>
                                <div>
                                    <strong style={{ color: '#FFF', display: 'block', fontSize: '14px' }}>Solana</strong>
                                    <span style={{ color: '#8A99AD', fontSize: '12px', display: 'block' }}>{solQty.toFixed(4)} SOL</span>
                                    <span style={{ color: '#5A6E85', fontSize: '11px' }}>Avg Buy: ₹{solAvg.toLocaleString("en-IN")}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ color: '#FFF', fontWeight: '700', display: 'block' }}>₹{solValue.toLocaleString("en-IN", {maximumFractionDigits: 0})}</span>
                                    <span style={{ color: solPnL.isPositive ? '#2EC4B6' : '#FF6B35', fontSize: '11px', fontWeight: 'bold' }}>{solPnL.text} PnL</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NET WORTH SUMMARY */}
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: `1px dashed ${theme.colors.border || '#2C353F'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#8A99AD', fontWeight: 'bold', fontSize: '13px' }}>TOTAL INTEGRATED PORTFOLIO NET WORTH:</span>
                        <span style={{ color: '#2EC4B6', fontWeight: '800', fontSize: '20px', fontFamily: 'monospace' }}>
                            ₹{totalNetWorth.toLocaleString("en-IN")}
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CryptoMarket;