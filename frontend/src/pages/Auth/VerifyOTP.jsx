import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { theme } from '../../theme';
import API from '../../config/api.js';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Route guard: agar flow ya identity nahi hai, toh wapas bhej do
    const state = location.state || {};
    const { flow, identity, name , email, phone  } = location.state || {};

    useEffect(() => {
        if (!flow || !identity) {
            navigate('/register');
        }
    }, [flow, identity, navigate]);

    const [formData, setFormData] = useState({
        otp: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

  
const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return;
    }

    setLoading(true);
    try {
        const payload = {
            otp: formData.otp.trim(),
            password: formData.password,
            flow,
            identity
        };

        if (flow === 'register') {
            payload.name = name;
            payload.email = email;
            payload.phone = phone;
        }
            
        const response = await API.post('/users/verify-otp', payload);

        if (response.data?.success) {
            const { token, refreshToken } = response.data;
            
            // Set tokens
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            
            alert('Success! Welcome to Wealth AI.');
            navigate('/dashboard'); // Clean navigation
        }
    } catch (err) {
        setError(err.response?.data?.message || "Verification failed.");
    } finally {
        setLoading(false);
    }
};

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: theme.colors.meshGradient }}>
            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', padding: '35px', borderRadius: '16px', background: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                <h2 style={{ textAlign: 'center', color: theme.colors.textMain }}>Verify OTP</h2>
                
                {error && (
                    <div style={{ color: '#fff', backgroundColor: theme.colors.danger, padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                        ⚠️ {error}
                    </div>
                )}

                <input type="text" name="otp" maxLength="6" value={formData.otp} onChange={handleChange} placeholder="Enter 6-Digit OTP" style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.textMain }} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New Password" style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.textMain }} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.textMain }} />

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: theme.colors.primary, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {loading ? 'Verifying...' : 'Confirm & Activate Account 🚀'}
                </button>
            </form>
        </div>
    );
};

export default VerifyOTP;