import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../theme';
import API from '../../config/api.js';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Single State Object for input and choice
    const [formData, setFormData] = useState({
        identifier: '', 
        notificationMethod: 'email' 
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Dynamic Change Handler 
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // FORM SUBMIT HANDLER - Logic Updated
    // ForgotPassword.jsx mein ye update karo
const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { identifier, notificationMethod } = formData;

    if (!identifier) {
        setError('Bhai, email ya phone number daalna zaroori hai!');
        setLoading(false);
        return;
    }

    try {
        // Path ko bilkul fix rakho, notificationMethod se route change mat karo
        // Backend router mein path '/forgotpassword' hai.
        const response = await API.post('/users/forgotpassword', {
            identity: identifier,
            method: notificationMethod // Backend ko method batao, lekin URL mat badlo
        });

        if (response.data?.success) {
            alert("OTP sent successfully!");
            navigate('/verify-otp', {
                state: { flow: 'forgot', identity: identifier }
            });
        }
    } catch (err) {
        // Check karo ki error backend se aa raha hai ya network se
        const serverMessage = err.response?.data?.message || 'Kuch toh jhol hai bhai!';
        setError(serverMessage);
    } finally {
        setLoading(false);
    }
};

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            padding:'40px 20px',
            fontFamily: 'sans-serif', 
            background: theme.colors.meshGradient,
            boxSizing: 'border-box'
        }}>
            <form onSubmit={handleSubmit} style={{ 
                width: '400px', 
                padding: '35px',
                maxWidth: '380px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.24)', 
                borderRadius: '16px', 
                background: theme.colors.surface, 
                border: `1px solid ${theme.colors.border}`
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '8px' 
                }}>
                    <span style={{ fontSize: '28px', fontWeight: '700', color: '#FAFAF9', letterSpacing: '0.5px', textShadow: '0 0 20px rgba(250, 255, 0, 0.4)' }}>Wealth</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', background: 'rgba(46, 196, 182, 0.15)', color: theme.colors.success, padding: '4px 10px', borderRadius: '6px', border: `1px solid rgba(46, 196, 182, 0.3)`, letterSpacing: '0.5px' }}>AI</span>
                </div>
                <p style={{ textAlign: 'center', color: theme.colors.textMuted, fontSize: '14px', marginBottom: '25px' }}>
                    Fill The Details To Recover Your Account
                </p>
                
                {error && (
                    <div style={{ color: '#fff', backgroundColor: theme.colors.danger, padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: theme.colors.textMuted }}>
                        Email Address / Phone Number
                    </label>
                    <input 
                        type="text" 
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleChange}
                        placeholder="YourEmail@.com"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, boxSizing: 'border-box', background: theme.colors.background, color: theme.colors.textMain, outline: 'none', fontSize: '15px' }}
                    />
                </div>

                <div style={{ marginBottom: '25px', padding: '15px', background: theme.colors.background, borderRadius: '10px', border: `1px solid ${theme.colors.border}` }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '14px', color: theme.colors.textMuted }}>
                        Get Reset OTP Via:
                    </label>
                    
                    <div style={{ display: 'flex', gap: '25px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: theme.colors.textMain }}>
                            <input 
                                type="radio" 
                                name="notificationMethod" 
                                value="email"
                                checked={formData.notificationMethod === 'email'}
                                onChange={handleChange}
                                style={{ accentColor: theme.colors.primary, cursor: 'pointer', scale: '1.2' }}
                            />
                            📩 SMS via Email
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: theme.colors.textMain }}>
                            <input 
                                type="radio" 
                                name="notificationMethod" 
                                value="phone"
                                checked={formData.notificationMethod === 'phone'}
                                onChange={handleChange}
                                style={{ accentColor: theme.colors.primary, cursor: 'pointer', scale: '1.2' }}
                            />
                            SMS via Phone
                        </label>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', padding: '14px', background: theme.colors.primary, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)', transition: theme.transitions.smooth }}
                >
                    {loading ? 'Ruko Bhai...' : 'Send Reset Link/OTP '}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;