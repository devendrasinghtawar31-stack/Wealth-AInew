import { useState, useEffect } from "react";
import { theme } from "../../theme";
import API from "../../config/api.js";

//  Props me 'lastSpunAt' add kar diya
const SpinWheelModal = ({ onClose, updateWalletCoins, lastSpunAt }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rewardMessage, setRewardMessage] = useState("");
    const [rotation, setRotation] = useState(0);
    const [hasSpun, setHasSpun] = useState(false);
    const [wonCoins, setWonCoins] = useState(0);

    //  Dummy time hata kar by default 0 rakha hai
    const [timeLeft, setTimeLeft] = useState(0); 

   //Asli Backend Time Calculation
    useEffect(() => {
        const calculateRemainingTime = () => {
            if (!lastSpunAt) return 0; // Agar kabhi spin nahi kiya to 0 time (turant spin kar sakta hai)
            
            const lastSpunTime = new Date(lastSpunAt).getTime();
            const now = new Date().getTime();
            const cooldown = 24 * 60 * 60 * 1000; // 6 ghante milliseconds me
            
            const difference = (lastSpunTime + cooldown) - now;
            
            // Agar difference 0 se bada hai to seconds return karo, warna 0
            return difference > 0 ? Math.floor(difference / 1000) : 0;
        };

        // Modal khulte hi ek baar set karega
        setTimeLeft(calculateRemainingTime());

        // Har second calculate karega (is se tab change karne par bhi time galat nahi hoga)
        const timer = setInterval(() => {
            setTimeLeft(calculateRemainingTime());
        }, 1000);

        return () => clearInterval(timer);
    }, [lastSpunAt]);
    console.log("Backend se aane wala time:", lastSpunAt, "Bacha hua time:", timeLeft);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    };

    const handleSpin = async () => {
        // Agar time bacha hai ya spin ho raha hai, toh function rok do
        if (isSpinning || hasSpun || timeLeft > 0) return; 
        
        setIsSpinning(true);
        try {
            const { data } = await API.post("/crypto/spin");
            const degrees = { 100: 30, 200: 90, 500: 150, 1000: 210, 2500: 270, 5000: 330 };
            const spinTo = 5 * 360 + (360 - degrees[data.coinsWon]);
            
            setRotation(spinTo);
            setWonCoins(data.coinsWon);
            
            setTimeout(() => {
                setIsSpinning(false);
                setHasSpun(true);
                updateWalletCoins(data.walletBalanceNow);
            }, 6000);
        } catch (e) { alert("Spin Failed"); setIsSpinning(false); }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>

            <button
              onClick={onClose}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#FF5630', padding: '5px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              ❌
            </button>
        <div style={{ 
    background: theme.colors.surface, // Dashboard ka background color
    padding: "30px", 
    borderRadius: "16px",             // Modern look ke liye thoda rounded
    border: `1px solid ${theme.colors.border}`, // Dashboard jaisa border
    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",   // Halka shadow depth ke liye
    textAlign: "center", 
    width: "380px", 
    position: "relative" 
}}>
                
                <div style={{ position: "absolute", top: "90px", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "15px solid transparent", borderRight: "15px solid transparent", borderTop: "25px solid #FFD700", zIndex: 20 }}></div>
                
                {!hasSpun ? (
                    <>
                        <h2 style={{ color: "#FFF", marginBottom: "20px" }}>Daily Fortune Spin 🎡</h2>
                        <svg viewBox="0 0 200 200" style={{ width: "250px", transform: `rotate(${rotation}deg)`, transition: "transform 6s cubic-bezier(0.1, 0.8, 0.1, 1)" }}>
                            <circle cx="100" cy="100" r="100" fill="#334155" />
                            <path d="M100 100 L100 0 A100 100 0 0 1 186.6 50 Z" fill="#FF6B35" />
                            <path d="M100 100 L186.6 50 A100 100 0 0 1 186.6 150 Z" fill="#2EC4B6" />
                            <path d="M100 100 L186.6 150 A100 100 0 0 1 100 200 Z" fill="#FF9F1C" />
                            <path d="M100 100 L100 200 A100 100 0 0 1 13.4 150 Z" fill="#E5A93B" />
                            <path d="M100 100 L13.4 150 A100 100 0 0 1 13.4 50 Z" fill="#1B9AAA" />
                            <path d="M100 100 L13.4 50 A100 100 0 0 1 100 0 Z" fill="#4EA8DE" />
                            <text x="145" y="40" fill="white" fontSize="12" fontWeight="bold" transform="rotate(30 145 40)">100</text>
                            <text x="160" y="105" fill="white" fontSize="12" fontWeight="bold" transform="rotate(90 160 105)">200</text>
                            <text x="145" y="170" fill="white" fontSize="12" fontWeight="bold" transform="rotate(150 145 170)">500</text>
                            <text x="60" y="170" fill="white" fontSize="12" fontWeight="bold" transform="rotate(210 60 170)">1000</text>
                            <text x="40" y="105" fill="white" fontSize="12" fontWeight="bold" transform="rotate(270 40 105)">2500</text>
                            <text x="60" y="40" fill="white" fontSize="12" fontWeight="bold" transform="rotate(330 60 40)">5000</text>
                        </svg>

                        {/*  Button ko disabled kiya agar time bacha hai */}
                        <button 
                            onClick={handleSpin} 
                            disabled={isSpinning || timeLeft > 0} 
                            style={{ 
                                marginTop: "30px", 
                                width: "100%", 
                                padding: "15px", 
                                background: (isSpinning || timeLeft > 0) ? "#666" : "#FFD700", // Disabled par grey dikhega
                                color: (isSpinning || timeLeft > 0) ? "#aaa" : "#000",
                                border: "none", 
                                borderRadius: "10px", 
                                fontWeight: "800", 
                                cursor: (isSpinning || timeLeft > 0) ? "not-allowed" : "pointer" 
                            }}>
                            {isSpinning ? "Spinning..." : " SPIN NOW"}
                        </button>
                        
                        {/*: Sirf tabhi time dikhao jab time bacha ho */}
                        {timeLeft > 0 && (
                            <div style={{ marginTop: "15px", color: "#8F9CA7", fontSize: "14px" }}>
                                Next spin in: <span style={{ color: "#FF6B35", fontWeight: "bold" }}>{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ padding: "20px 0" }}>
                        <div style={{ fontSize: "60px", marginBottom: "10px" }}>🎁</div>
                        <h2 style={{ color: "#FFF" }}>Congratulations!</h2>
                        <p style={{ color: "#8A99AD" }}>You Have Won:</p>
                        <div style={{ color: "#FFD700", fontSize: "40px", fontWeight: "900", margin: "10px 0" }}>{wonCoins} Coins</div>
                        <button onClick={onClose} style={{ width: "100%", padding: "15px", background: "#2EC4B6", border: "none", borderRadius: "10px", color: "#FFF", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>
                            CLAIM COINS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default SpinWheelModal;