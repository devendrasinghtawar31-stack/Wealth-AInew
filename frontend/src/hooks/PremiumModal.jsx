import React from 'react';
import { useRazorpay } from '../hooks/useRazorpay';
import { theme } from '../theme';

const PremiumModal = ({ user, onClose }) => {
    const { initiatePayment, loading } = useRazorpay();
    console.log("Modal User Object:", user);

    // 🛡️ Safety check: Check karo ki user exist karta hai ya nahi
    const isReady = true
        // user && user._id;,

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: theme.colors.surface, padding: '30px', borderRadius: '16px',
                width: '400px', border: `1px solid ${theme.colors.border}`,
                textAlign: 'center', color: 'white'
            }}>
                <h2 style={{ marginBottom: '20px' }}>Unlock WealthAI Elite 👑</h2>
                <ul style={{ textAlign: 'left', marginBottom: '30px', listStyle: 'none' }}>
                    <li style={{ padding: '8px 0' }}>✅ 1lkh Bonus Coins (Instant)</li>
                    <li style={{ padding: '8px 0' }}>✅ Faster AI Analysis</li>
                    <li style={{ padding: '8px 0' }}>✅ Advanced Transaction Insights</li>
                    <li style={{ padding: '8px 0' }}>✅ Zero Ads Experience</li>
                </ul>
                
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <button 
                        onClick={() => isReady && initiatePayment(user)}
                        disabled={loading || !isReady}
                        style={{
                            padding: '12px', 
                            background: (loading || !isReady) ? '#444' : theme.colors.primary, 
                            border: 'none',
                            borderRadius: '8px', 
                            color: 'white', 
                            fontWeight: 'bold', 
                            cursor: (loading || !isReady) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? "Initializing..." : !isReady ? "Loading Profile..." : "Pay ₹1 - Upgrade Now"}
                    </button>
                    
                    <button 
                        onClick={onClose}
                        style={{
                            padding: '12px', background: 'transparent', border: '1px solid #444',
                            borderRadius: '8px', color: '#888', cursor: 'pointer'
                        }}
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumModal;