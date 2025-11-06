import React from 'react';
import { AuthContext } from '../contexts/AuthContext';
import styles from '../styles/Authentication.module.css';

export default function Authentication() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [formState, setFormState] = React.useState(0); // 0 = login, 1 = register
    const [showMessage, setShowMessage] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        // Basic validation
        if (!username.trim() || !password.trim()) {
            setError("Please fill in all fields");
            return;
        }
        
        if (formState === 1 && !name.trim()) {
            setError("Please enter your full name");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError("");
        
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setUsername("");
                setName("");
                setPassword("");
                setMessage(result);
                setShowMessage(true);
                setError("");
                setFormState(0);
                setTimeout(() => setShowMessage(false), 4000);
            }
        } catch (err) {
            console.log(err);
            let message = err?.response?.data?.message || "Something went wrong. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFormState = () => {
        setFormState(formState === 0 ? 1 : 0);
        setError("");
        setMessage("");
    };

    return (
        <div className={styles.authContainer}>
            {/* Background Pattern */}
            <div className={styles.backgroundPattern} />
            
            {/* Left Side - Hero */}
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <img src="/logo.png" alt="ConnectHub Logo" className={styles.heroLogo} />
                    <h1 className={styles.heroTitle}>Welcome to ConnectHub</h1>
                    <p className={styles.heroSubtitle}>
                        Connect with your loved ones through high-quality video calls. 
                        Experience seamless communication with our modern platform.
                    </p>
                </div>
            </div>
            
            {/* Right Side - Form */}
            <div className={styles.formSection}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <div className={styles.iconContainer}>
                            <span className={styles.lockIcon}>🔒</span>
                        </div>
                        <h2 className={styles.formTitle}>
                            {formState === 0 ? 'Sign In' : 'Create Account'}
                        </h2>
                    </div>

                    {/* Toggle Buttons */}
                    <div className={styles.toggleGroup}>
                        <button 
                            className={`${styles.toggleButton} ${formState === 0 ? styles.active : ''}`}
                            onClick={() => setFormState(0)}
                        >
                            Sign In
                        </button>
                        <button 
                            className={`${styles.toggleButton} ${formState === 1 ? styles.active : ''}`}
                            onClick={() => setFormState(1)}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleAuth(); }}>
                        {formState === 1 && (
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>
                        
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>

                        {error && (
                            <div className={styles.errorAlert}>
                                <span className={styles.errorIcon}>⚠️</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? "Please wait..." : (formState === 0 ? "Sign In" : "Create Account")}
                        </button>

                        <div className={styles.switchForm}>
                            <p>
                                {formState === 0 ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={toggleFormState}
                                    className={styles.switchButton}
                                >
                                    {formState === 0 ? "Sign Up" : "Sign In"}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Success Message */}
            {showMessage && (
                <div className={styles.successMessage}>
                    <div className={styles.messageContent}>
                        <span className={styles.successIcon}>✅</span>
                        {message}
                    </div>
                </div>
            )}
        </div>
    );
}