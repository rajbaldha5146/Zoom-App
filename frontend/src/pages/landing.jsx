import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Button, Typography, Container, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import styles from '../styles/LandingPage.module.css';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
  },
}));

const PrimaryButton = styled(StyledButton)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea, #764ba2)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #5a6fd3, #6a3d9a)',
  },
}));

const SecondaryButton = styled(StyledButton)(({ theme }) => ({
  border: '2px solid',
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: 'rgba(102, 126, 234, 0.04)',
  },
}));

export default function LandingPage() {
  const router = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    // Add any initialization code here if needed
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Box className={styles.landingPageContainer}>
      {/* Animated Background */}
      <Box className={styles.backgroundAnimation} />
      
      {/* Navigation */}
      <Box component="nav" className={styles.navBar}>
        <Box className={styles.logoArea}>
          <Typography 
            variant="h5" 
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ConnectHub
          </Typography>
        </Box>
        
        <Box className={styles.navLinks}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <SecondaryButton 
              onClick={() => router("/aljk23")}
              sx={{ mr: 2 }}
            >
              Join as Guest
            </SecondaryButton>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <PrimaryButton 
              onClick={() => router("/auth")}
              variant="contained"
            >
              Get Started
            </PrimaryButton>
          </motion.div>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Box className={styles.landingMain}>
          <motion.div 
            className={styles.heroText}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Typography 
                variant="h2" 
                component="h1"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.2,
                  mb: 3,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Connect with your <span style={{ whiteSpace: 'nowrap' }}>loved ones</span>
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography 
                variant="h5" 
                component="p"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: '500px',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  lineHeight: 1.6,
                }}
              >
                Seamless video calls and messaging to stay connected with friends and family, no matter where you are.
              </Typography>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '2rem' }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <PrimaryButton 
                  variant="contained" 
                  size="large"
                  onClick={() => router("/auth")}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    animation: `${pulse} 2s infinite`,
                  }}
                >
                  Start Free Call
                </PrimaryButton>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <SecondaryButton 
                  variant="outlined" 
                  size="large"
                  onClick={() => router("/auth")}
                  sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                >
                  Learn More
                </SecondaryButton>
              </motion.div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex' }}>
                  {[1, 2, 3].map((i) => (
                    <Box 
                      key={i}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: '3px solid #fff',
                        ml: i > 1 ? -1.5 : 0,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      {i}
                    </Box>
                  ))}
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Join <strong>10,000+</strong> happy users today
                </Typography>
              </Box>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className={styles.heroImage}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <img 
              src="/mobile.png" 
              alt="ConnectHub app preview" 
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.2))',
              }} 
            />
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}