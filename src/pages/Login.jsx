import '../styles/Login.css';
import React, { useState } from 'react';
import { client } from '../appwrite';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
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
                <button type="submit" className='login-button'>Log In</button>
            </form>
        </div>
    );
}

export default Login;