import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../theme'; 

const Register = () => {
    const navigate = useNavigate();

    // Single State Object for complete form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notificationMethod: 'email' // Default choice is email
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Dynamic Input Handler 
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    //  FORM SUBMIT HANDLER (Connected with Backend Network Layer)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { name, email, phone, notificationMethod } = formData;

        // Validation Checkpost
        if (!name || !email || !phone) {
            setError('Name , Email , & Phone Number All Details Has to be filled!');
            setLoading(false);
            return;
        }

        try {
            console.log(" Dispatching user payload to secure verification engine...", formData);

            const formattedPhone = phone.startsWith('+91')? phone: `+91${phone}`
            //  THE CONNECTIVITY BRIDGE: Real network trigger points to Port 3000
            const response = await fetch('http://localhost:3000/api/users/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone:formattedPhone,
                  flow: 'register',
                    method: notificationMethod // This maps safely to activeMethod on backend now!
                })

            });

            const resData = await response.json();

            if (response.ok && resData.success) {
                //  Dynamic success feedback modal alert
                alert(resData.message || " Verification code sent successfully!");

                // Transitioning safely to validation controller view
                navigate('/verify-otp', {
                    state: {
                        flow: 'register',
                        name: name.trim(),
                        email: email.toLowerCase().trim(), //  Pass both data keys safely together
                        phone: formattedPhone,
                        identity: notificationMethod === 'email' ? email.toLowerCase().trim() : formattedPhone
                    }
                });
            } else {
               const backendErrorMessage = resData.message || resData.error || 'Bhai, OTP pipeline send block ho gayi!';
                setError(backendErrorMessage);
            }

        } catch (err) {
            console.error("Network Transmission Crash:", err);
            setError(' Network Error: Secure backend link unreachable!');
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
            padding: '40px 20px',
            fontFamily: 'sans-serif', 
            background: theme.colors.meshGradient,
            boxSizing: 'border-box'
        }}>
            <form onSubmit={handleSubmit} style={{ 
                width: '420px', 
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
                    <span style={{ 
                        fontSize: '28px', 
                        fontWeight: '700', 
                        color: '#FAFAF9', 
                        letterSpacing: '0.5px',
                        textShadow: '0 0 20px rgba(250, 255, 0, 0.4)' 
                    }}>
                        Wealth
                    </span>
                    
                    <span style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        fontFamily: 'monospace', 
                        background: 'rgba(46, 196, 182, 0.15)', 
                        color: theme.colors.success, 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        border: `1px solid rgba(46, 196, 182, 0.3)`,
                        letterSpacing: '0.5px'
                    }}>
                        AI
                    </span>
                </div>
                <p style={{ 
                    textAlign: 'center', 
                    color: theme.colors.textMuted, 
                    fontSize: '14px', 
                    marginBottom: '25px' 
                }}>
                    Fill The Details To Register
                </p>
                
                {error && (
                    <div style={{ 
                        color: '#fff', 
                        backgroundColor: theme.colors.danger, 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginBottom: '20px', 
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Name Input */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: theme.colors.textMuted }}>
                        Full Name
                    </label>
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        style={{ 
                            width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, 
                            boxSizing: 'border-box', background: theme.colors.background, color: theme.colors.textMain, outline: 'none', fontSize: '15px'
                        }}
                    />
                </div>

                {/* Email Input */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: theme.colors.textMuted }}>
                        Email Address
                    </label>
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your Gmail@.com"
                        style={{ 
                            width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, 
                            boxSizing: 'border-box', background: theme.colors.background, color: theme.colors.textMain, outline: 'none', fontSize: '15px'
                        }}
                    />
                </div>

                {/* Phone Input */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: theme.colors.textMuted }}>
                        Phone Number
                    </label>
                    <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 xxxxxxxxxx"
                        style={{ 
                            width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, 
                            boxSizing: 'border-box', background: theme.colors.background, color: theme.colors.textMain, outline: 'none', fontSize: '15px'
                        }}
                    />
                </div>

                {/* Tier/Method Selection Box */}
                <div style={{ 
                    marginBottom: '25px', padding: '15px', background: theme.colors.background, 
                    borderRadius: '10px', border: `1px solid ${theme.colors.border}` 
                }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '14px', color: theme.colors.textMuted }}>
                        Get Verification OTP Via:
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
                             Official Email
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
                             Secure SMS
                        </label>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', padding: '14px', 
                        background: theme.colors.success, 
                        color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', 
                        fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 12px rgba(46, 196, 182, 0.2)',
                        transition: theme.transitions.smooth,
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? 'Sending Security Code...' : 'Request Verification OTP ✉️'}
                </button>
            </form>
        </div>
    );
};

export default Register;