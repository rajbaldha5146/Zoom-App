import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LandingPage.module.css';

export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className={styles.landingPageContainer}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation} />
      
      {/* Navigation */}
      <nav className={styles.navBar}>
        <div className={styles.logoArea}>
          <h1 className={styles.logoText}>ConnectHub</h1>
        </div>
        
        <div className={styles.navLinks}>
          <button 
            className={styles.secondaryButton}
            onClick={() => router("/aljk23")}
          >
            Join as Guest
          </button>
          
          <button 
            className={styles.primaryButton}
            onClick={() => router("/auth")}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={styles.landingMain}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Connect with your <span className={styles.highlight}>loved ones</span>
          </h1>
          
          <p className={styles.heroSubtitle}>
            Seamless video calls and messaging to stay connected with friends and family, no matter where you are.
          </p>
          
          <div className={styles.buttonGroup}>
            <button 
              className={styles.ctaButton}
              onClick={() => router("/auth")}
            >
              Start Free Call
            </button>
            
            <button 
              className={styles.secondaryCtaButton}
              onClick={() => router("/auth")}
            >
              Learn More
            </button>
          </div>
          
          <div className={styles.socialProof}>
            <div className={styles.avatarGroup}>
              <div className={styles.avatar}>1</div>
              <div className={styles.avatar}>2</div>
              <div className={styles.avatar}>3</div>
            </div>
            <p className={styles.socialText}>
              Join <strong>10,000+</strong> happy users today
            </p>
          </div>
        </div>
        
        <div className={styles.heroImage}>
          <img 
            src="/mobile.png" 
            alt="ConnectHub app preview"
            className={styles.heroImg}
          />
        </div>
      </main>
    </div>
  );
}