import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import './Login.css';

const Login = ({ onEnterSystem }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [show2FA, setShow2FA] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Timer Logic for 2FA
    useEffect(() => {
        let timer;
        if (show2FA && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setCanResend(true);
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [show2FA, timeLeft]);

    // Phase 1: Initial Login (Email & Password)
    const handleLogin = async (e) => {
        if (e) e.preventDefault(); 
        
        setError('');
        setIsLoading(true);

        try {
            // Using 'api' instance and removing redundant '/api' prefix
            const response = await api.post('/login', { email, password });

            if (response.data.status === '2FA_REQUIRED') {
                setTimeout(() => {
                    setIsLoading(false);
                    setShow2FA(true);
                    setTimeLeft(60);
                    setCanResend(false);
                }, 800);
            }
        } catch (err) {
            setIsLoading(false);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    // Phase 2: Verify OTP Code
    const handleVerifyCode = async (e) => {
        if (e) e.preventDefault(); 
        
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/verify-2fa', {
                email: email,
                code: twoFactorCode
            });

            if (response.data.access_token) {
                // CHANGE: Use sessionStorage instead of localStorage
                // This ensures each tab keeps its own unique login session
                sessionStorage.setItem('token', response.data.access_token);
                sessionStorage.setItem('user', JSON.stringify(response.data.user));

                // Save the role to sessionStorage as well
                sessionStorage.setItem('user_role', response.data.user.role);

                // Update axios header for this specific tab session immediately
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

                setTimeout(() => {
                    onEnterSystem(response.data.user);
                    setIsLoading(false);
                }, 500);
            }
        } catch (err) {
            setIsLoading(false);
            setError(err.response?.data?.message || 'The verification code is invalid or expired.');
        }
    };

    return (
        <div className="landing-screen">
            <div className="login-box">
                <div className="brand-header">
                    <div className="logo-square">VE</div>
                    <h1>Vision International Construction OPC</h1>
                    <p>{show2FA ? 'Security Verification' : 'Internal Management System'}</p>
                </div>

                <form onSubmit={show2FA ? handleVerifyCode : handleLogin}>
                    {!show2FA ? (
                        <>
                            <div className="input-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    disabled={isLoading} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="Enter your email"
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    disabled={isLoading} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Enter your password"
                                    required 
                                />
                            </div>
                        </>
                    ) : (
                        <div className="input-group">
                            <label>Enter 6-Digit Code</label>
                            <div className="timer-display">Expires in: <span className={timeLeft < 10 ? 'urgent' : ''}>{timeLeft}s</span></div>
                            <input 
                                type="text" 
                                maxLength="6" 
                                className="otp-input"
                                placeholder="000000"
                                value={twoFactorCode} 
                                disabled={isLoading} 
                                onChange={(e) => setTwoFactorCode(e.target.value)} 
                                required 
                                autoFocus 
                            />
                            <div className="resend-container">
                                {canResend ? (
                                    <button type="button" className="resend-link" onClick={handleLogin}>
                                        Resend Code
                                    </button>
                                ) : (
                                    <span className="resend-wait">Wait to resend</span>
                                    
                                )}
                            </div>
                        </div>
                    )}
                    
                    <button type="submit" className="enter-btn" disabled={isLoading}>
                        {isLoading ? (
                            <div className="loader-dots">
                                <span></span><span></span><span></span>
                            </div>
                        ) : (
                            show2FA ? 'Verify & Enter' : 'Sign In'
                        )}
                    </button>
                </form>

                {error && (
                    <div className="login-error">
                        <i className="error-icon">⚠️</i> {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;