import '../styles/Login.css';
import React, { useState } from 'react';
import { account } from '../appwrite';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    const handleCreateAccount = async () => {
        setLoading(true);
        try {
            // Let Appwrite generate a unique user ID
            await account.create('unique()', email, password);
            alert('Account created! You can now log in.');
        } catch (err) {
            alert(err.message || 'Failed to create account.');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <h2>Welcome to Quotient</h2>
            <form className='login-form' onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className='login-button' disabled={loading}>Log In</button>
                <button
                    type="button"
                    className='create-account-button'
                    onClick={handleCreateAccount}
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Account'}
                </button>
            </form>
        </div>
    );
}

export default Login;