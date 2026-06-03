import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../../theme";
import { useAuth } from "../../context/AuthContext"; 
import API from "../../config/api";

const BankOnboarding = () => {
    const navigate = useNavigate();
    const { user , refreshUser } = useAuth(); 

    //  ONBOARDING LOCAL COMPACT STATE
    const [formData, setFormData] = useState({
        isPremium: user?.isPremium || false, 
        allBanks: [],             
        searchQuery: '',          
        selectedBanks: [],        
        loadingState: 'idle',     // 'idle' | 'processing' | 'success'
        pageFetchLoading: true    
    });

    // Background session support update
   useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, isPremium: user.isPremium || false }));
        }
    }, [user]);

    // 1. GET BANKS (API Instance Use)
    useEffect(() => {
        const fetchLiveBanks = async () => {
            try {
                setFormData(prev => ({ ...prev, pageFetchLoading: true }));
                const response = await API.get('/banks'); // Interceptor handles auth
                
                if (response.data && response.data.success) {
                    setFormData(prev => ({ ...prev, allBanks: response.data.data || [], pageFetchLoading: false }));
                }
            } catch (error) {
                console.warn(" Onboarding Fallback protocol:", error);
                setFormData(prev => ({ ...prev, allBanks: [
                    { id: 'SBIN', name: 'State Bank of India', logo: '🏦' },
                    { id: 'HDFC', name: 'HDFC Bank', logo: '🏦' },
                    { id: 'ICIC', name: 'ICICI Bank', logo: '🏦' },
                    { id: 'UTIB', name: 'Axis Bank', logo: '🏦' },
                    { id: 'KKBK', name: 'Kotak Mahindra Bank', logo: '🏦' }
                ], pageFetchLoading: false }));
            }
        };
        fetchLiveBanks();
    }, []);

    // 2. SYNC BANKS (API Instance Use)
    useEffect(() => {
        const syncBanksWithBackend = async () => {
            try {
                const response = await API.post('/banks/sync', { 
                    
                    selectedBanks: formData.selectedBanks 
                });
                console.log("--> API Response from Backend:", response.data);

                if (response.data && response.data.success) {
                    setFormData(prev => ({ ...prev, loadingState: 'success' }));
                } else {
                    alert(`Sync Failed: ${response.data.message || 'Server rejected selection'}`);
                    setFormData(prev => ({ ...prev, loadingState: 'idle' }));
                }
            } catch (error) {
                console.error("Transmission Error:", error);
                alert("Network Error: Could not sync with server.");
                setFormData(prev => ({ ...prev, loadingState: 'idle' }));
            }
        };

        if (formData.loadingState === 'processing') syncBanksWithBackend();
        
        if (formData.loadingState === 'success') {
            const timer = setTimeout(async () => {
                alert(`Accounts Linked Successfully!`);
                await refreshUser();
                navigate('/dashboard');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [formData.loadingState, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleBankSelect = (bankId) => {
        if (formData.loadingState !== 'idle') return;

        const currentSelected = formData.selectedBanks;

        if (currentSelected.includes(bankId)) {
            setFormData({
                ...formData,
                selectedBanks: currentSelected.filter(id => id !== bankId)
            });
            return;
        }
        
        if (!formData.isPremium && currentSelected.length >= 2) {
            alert('⚠️ Upgrade Plan: Free tier allows selection for a maximum of 2 banks!');
            return;
        }

        setFormData({
            ...formData,
            selectedBanks: [...currentSelected, bankId]
        });
    };

    const filteredBanks = formData.allBanks.filter(bank =>
        bank.name.toLowerCase().includes(formData.searchQuery.toLowerCase()) ||
        bank.id.toLowerCase().includes(formData.searchQuery.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: theme.colors.meshGradient, color: theme.colors.textMain, fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
                
                {/*  SENIOR DEV MINIMALIST UP-SIDE NOTE ALIGNMENT */}
                <div style={{ background: 'rgba(229,169,59,0.06)', border: '1px solid rgba(229,169,59,0.2)', borderRadius: '10px', padding: '12px 25px', marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textMuted, fontWeight: '500' }}>
                        💡 <span style={{ color: '#E5A93B', fontWeight: 'bold' }}>Note:</span> Free tier allows configuration for a maximum of 2 banks. Unlock unlimited access anytime.
                    </p>
                    {!formData.isPremium && (
                        <span onClick={() => setFormData(prev => ({ ...prev, isPremium: true }))} style={{ color: '#E5A93B', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
                            Upgrade To Premium Elite 
                        </span>
                    )}
                </div>

                {/*  ONBOARDING HEADER PACKET */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Setup Your Wealth Profile 👋</h1>
                    <p style={{ margin: '8px 0 0 0', color: theme.colors.textMuted, fontSize: '15px' }}>
                        Select your financial institutions to interconnect secure credentials and auto-build charts.
                    </p>
                </div>

                {/* SECURE LINK PROCESSING STEPPER SCREEN */}
                {formData.loadingState !== 'idle' && (
                    <div style={{ background: theme.colors.surface, border: `1px solid ${formData.loadingState === 'success' ? theme.colors.success : theme.colors.primary}`, borderRadius: '12px', padding: '30px', textAlign: 'center', marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        {formData.loadingState === 'processing' ? (
                            <>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid rgba(255, 107, 53, 0.1)`, borderTop: `3px solid ${theme.colors.primary}`, animation: 'spin 1s linear infinite' }} />
                                <p style={{ margin: 0, fontWeight: '600', color: theme.colors.primary }}>Securing your bank connections and setting up your automated dashboard...</p>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '32px', color: theme.colors.success }}>✅</div>
                                <p style={{ margin: 0, fontWeight: '600', color: theme.colors.success }}>Connections linked! Redirecting straight to your core engine panels...</p>
                            </>
                        )}
                    </div>
                )}

                {/*  SEARCH FIELD */}
                <div style={{ marginBottom: '25px' }}>
                    <input type="text" name="searchQuery" value={formData.searchQuery} onChange={handleChange} placeholder="🔍 Search or filter bank names instantly..." style={{ width: '100%', padding: '15px 20px', borderRadius: '10px', border: `1px solid ${theme.colors.border}`, background: theme.colors.surface, color: theme.colors.textMain, fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/*  INTUITIVE GRID COMPONENT LAYER */}
                <div style={{ marginBottom: '40px' }}>
                    {formData.pageFetchLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: theme.colors.textMuted }}>Loading secure components matrix...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                            {filteredBanks.map((bank) => {
                                const isSelected = formData.selectedBanks.includes(bank.id);
                                const isLocked = !formData.isPremium && formData.selectedBanks.length >= 2 && !isSelected;

                                return (
                                    <div key={bank.id} onClick={() => !isLocked && handleBankSelect(bank.id)} style={{ background: isSelected ? 'rgba(46, 196, 182, 0.08)' : theme.colors.surface, border: isSelected ? `2px solid ${theme.colors.success}` : `1px solid ${theme.colors.border}`, borderRadius: '12px', padding: '25px', textAlign: 'center', cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.35 : 1, position: 'relative', transition: 'all 0.2s ease' }}>
                                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>{bank.logo}</div>
                                        <div style={{ fontWeight: '600', fontSize: '15px' }}>{bank.name}</div>
                                        <div style={{ fontSize: '11px', color: theme.colors.textMuted, marginTop: '5px', fontFamily: 'monospace' }}>ID: {bank.id}</div>
                                        
                                        {isSelected && <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '11px', color: theme.colors.success, fontWeight: 'bold' }}>✓ Selected</div>}
                                        {isLocked && <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '11px', color: theme.colors.primary, fontWeight: 'bold' }}>🔒 Locked</div>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/*  SYNC SUBMIT TERMINAL */}
                <div style={{ textAlign: 'center' }}>
                    <button onClick={() => setFormData(prev => ({ ...prev, loadingState: 'processing' }))} disabled={formData.loadingState !== 'idle' || formData.selectedBanks.length === 0} style={{ padding: '14px 50px', background: theme.colors.success, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: (formData.loadingState !== 'idle' || formData.selectedBanks.length === 0) ? 0.5 : 1, boxShadow: '0 4px 12px rgba(46, 196, 182, 0.3)' }}>
                        Save & Sync Account Data ({formData.selectedBanks.length})
                    </button>
                </div>
            </main>

            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default BankOnboarding;