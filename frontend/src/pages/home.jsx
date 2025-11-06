import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/Home.module.css';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) {
            return;
        }
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleJoinVideoCall();
        }
    };

    return (
        <div className={styles.homeWrapper}>
            {/* Navigation Bar */}
            <nav className={styles.navBar}>
                <div className={styles.navContainer}>
                    <div className={styles.logoArea}>
                        <img src="/logo.png" alt="ConnectHub Logo" className={styles.logo} />
                        <h2 className={styles.logoText}>ConnectHub</h2>
                    </div>

                    <div className={styles.navLinks}>
                        <button 
                            className={styles.navButton}
                            onClick={() => navigate("/history")}
                        >
                            <span className={styles.icon}>🕒</span>
                            History
                        </button>
                        <button 
                            className={styles.navButton}
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/auth");
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.contentGrid}>
                    {/* Left Panel - Join Meeting */}
                    <div className={styles.leftPanel}>
                        <h1 className={styles.mainTitle}>Join Your Meeting</h1>
                        
                        <p className={styles.subtitle}>
                            Enter your meeting code to connect with participants instantly. 
                            Experience high-quality video calls with crystal clear audio.
                        </p>

                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder="Meeting Code"
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className={styles.meetingInput}
                            />
                            <button
                                onClick={handleJoinVideoCall}
                                disabled={!meetingCode.trim()}
                                className={styles.joinButton}
                            >
                                <span className={styles.icon}>📹</span>
                                Join Meeting
                            </button>
                        </div>

                        <p className={styles.hint}>Press Enter to join quickly</p>
                    </div>

                    {/* Right Panel - Features */}
                    <div className={styles.rightPanel}>
                        <div className={styles.imageContainer}>
                            <img
                                src="/logo3.png"
                                alt="Video Call"
                                className={styles.heroImage}
                            />
                        </div>

                        {/* Feature Cards */}
                        <div className={styles.featuresGrid}>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>🎥</div>
                                <h3>HD Quality</h3>
                                <p>Crystal clear video and audio quality</p>
                            </div>

                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>🔒</div>
                                <h3>Secure</h3>
                                <p>End-to-end encrypted communications</p>
                            </div>

                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>👥</div>
                                <h3>Multi-Party</h3>
                                <p>Support for multiple participants</p>
                            </div>

                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>📺</div>
                                <h3>Screen Share</h3>
                                <p>Share your screen with participants</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default withAuth(HomeComponent);