import '../styles/Login.css';
import React, { useState } from 'react';
import { account, databases } from '../appwrite';
import { motion, AnimatePresence } from 'framer-motion';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(true);

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

            // add user to database
            await databases.createDocument("main", "users", (await account.get()).$id, {
                username: email.split('@')[0]
            });

        } catch (err) {
            alert(err.message || 'Failed to create account.');
        }
        setLoading(false);
    };

    return (
        <motion.div className="login-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
            <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 80 }}>
                Welcome to Quotient
            </motion.h2>
            <AnimatePresence mode="wait">
                {showForm && (
                    <motion.form
                        className='login-form'
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <motion.input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="login-input"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        />
                        <motion.input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="login-input"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        />
                        <motion.button
                            type="submit"
                            className='login-button'
                            disabled={loading}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Log In
                        </motion.button>
                        <motion.button
                            type="button"
                            className='create-account-button'
                            onClick={handleCreateAccount}
                            disabled={loading}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Creating...' : 'Create Account'}
                        </motion.button>
                    </motion.form>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default Login;