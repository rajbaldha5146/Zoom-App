import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { 
    Button, 
    IconButton, 
    TextField, 
    Box, 
    Typography, 
    Container,
    Paper,
    Grid,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import HighQualityIcon from '@mui/icons-material/HighQuality';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) {
            return; // Don't proceed if meeting code is empty
        }
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleJoinVideoCall();
    }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            {/* Navigation Bar */}
            <Box
                sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Container maxWidth="xl">
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img src="/logo.png" alt="ConnectHub Logo" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                            <Typography
                                variant="h5"
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

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                startIcon={<RestoreIcon />}
                                onClick={() => navigate("/history")}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    color: 'text.secondary',
                                    '&:hover': {
                                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                        color: 'primary.main',
                                    },
                                }}
                            >
                                History
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    navigate("/auth");
                                }}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    borderColor: 'error.main',
                                    color: 'error.main',
                                    '&:hover': {
                                        backgroundColor: 'error.main',
                                        color: 'white',
                                    },
                                }}
                            >
                        Logout
                    </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ py: 6 }}>
                <Grid container spacing={6} alignItems="center">
                    {/* Left Panel - Join Meeting */}
                    <Grid item xs={12} lg={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 5,
                                borderRadius: 4,
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    mb: 3,
                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    lineHeight: 1.2,
                                }}
                            >
                                Join Your Meeting
                            </Typography>

                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{ mb: 4, lineHeight: 1.6 }}
                            >
                                Enter your meeting code to connect with participants instantly. 
                                Experience high-quality video calls with crystal clear audio.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <TextField
                                    fullWidth
                                    label="Meeting Code"
                                    variant="outlined"
                                    value={meetingCode}
                                    onChange={(e) => setMeetingCode(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    sx={{
                                        flex: 1,
                                        minWidth: 250,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            '&:hover fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleJoinVideoCall}
                                    disabled={!meetingCode.trim()}
                                    startIcon={<VideoCallIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderRadius: 3,
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                                            transform: 'translateY(-2px)',
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    Join Meeting
                                </Button>
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 2, fontStyle: 'italic' }}
                            >
                                Press Enter to join quickly
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Right Panel - Features */}
                    <Grid item xs={12} lg={6}>
                        <Box sx={{ textAlign: 'center' }}>
                            <img
                                src="/logo3.png"
                                alt="Video Call"
                                style={{
                                    width: '100%',
                                    maxWidth: 500,
                                    height: 'auto',
                                    borderRadius: 20,
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                                    marginBottom: 40,
                                }}
                            />

                            {/* Feature Cards */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <HighQualityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            HD Quality
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Crystal clear video and audio quality
                                        </Typography>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <SecurityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            Secure
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            End-to-end encrypted communications
                                        </Typography>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            Multi-Party
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Support for multiple participants
                                        </Typography>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <VideoCallIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            Screen Share
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Share your screen with participants
                                        </Typography>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default withAuth(HomeComponent);