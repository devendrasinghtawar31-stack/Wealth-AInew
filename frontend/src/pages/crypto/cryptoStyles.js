/**
 * 
 * Separating global injection keyframes from rendering logic.
 */
export const cryptoStyles = `
    @keyframes cardSlideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    @keyframes neonPulseGlow {
        0% { box-shadow: 0 0 12px rgba(46, 196, 182, 0.05); border-color: rgba(46, 196, 182, 0.1); }
        50% { box-shadow: 0 0 20px rgba(46, 196, 182, 0.25); border-color: rgba(46, 196, 182, 0.4); }
        100% { box-shadow: 0 0 12px rgba(46, 196, 182, 0.05); border-color: rgba(46, 196, 182, 0.1); }
    }
    @keyframes greenFlash { 0% { background: rgba(46, 196, 182, 0.2); } 100% { background: transparent; } }
    @keyframes redFlash { 0% { background: rgba(255, 107, 53, 0.2); } 100% { background: transparent; } }
    
    .animate-page-matrix { 
        animation: cardSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
    }
    .crypto-card-pulse { 
        animation: neonPulseGlow 4s infinite ease-in-out; 
        transition: all 0.3s ease; 
    }
    .crypto-card-pulse:hover { 
        transform: translateY(-4px); 
    }
    .flash-up { animation: greenFlash 0.8s ease-out; }
    .flash-down { animation: redFlash 0.8s ease-out; }
`;

export const injectCryptoStyles = () => {
    const styleId = "crypto-core-animations";
    if (document.getElementById(styleId)) return;

    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.innerText = cryptoStyles;
    document.head.appendChild(styleSheet);
};