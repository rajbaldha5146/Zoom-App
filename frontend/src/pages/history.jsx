import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import { 
    Card, 
    Box, 
    CardActions, 
    CardContent, 
    Button, 
    Typography, 
    IconButton,
    Container,
    Grid,
    Paper,
    Chip,
    Divider,
    Skeleton
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CodeIcon from '@mui/icons-material/Code';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [getHistoryOfUser]);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        return `${day}/${month}/${year} at ${hours}:${minutes}`;
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInMinutes > 0) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    };

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            py: 4
        }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <HistoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            <Box>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 800,
                                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    Meeting History
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Your recent video call sessions
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Button
                            variant="outlined"
                            startIcon={<HomeIcon />}
                            onClick={() => routeTo("/home")}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 3,
                                px: 3,
                                py: 1.5,
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                },
                            }}
                        >
                            Back to Home
                        </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            icon={<VideoCallIcon />}
                            label={`${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}`}
                            color="primary"
                            variant="outlined"
                        />
                    </Box>
                </Paper>

                {/* Meeting Cards */}
                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3].map((item) => (
                            <Grid item xs={12} md={6} lg={4} key={item}>
                                <Skeleton
                                    variant="rectangular"
                                    height={200}
                                    sx={{ borderRadius: 3 }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : meetings.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 8,
                            textAlign: 'center',
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <HistoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                            No meetings yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Join your first meeting to see it appear here
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<VideoCallIcon />}
                            onClick={() => routeTo("/home")}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                            }}
                        >
                            Join a Meeting
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {meetings.map((meeting, index) => (
                            <Grid item xs={12} md={6} lg={4} key={index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        borderRadius: 3,
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Box
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                }}
                                            >
                                                <VideoCallIcon />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    Meeting #{index + 1}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {getTimeAgo(meeting.date)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <CodeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Meeting Code:
                                    </Typography>
                                            </Box>
                                            <Chip
                                                label={meeting.meetingCode}
                                                variant="outlined"
                                                color="primary"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(meeting.date)}
                                    </Typography>
                                        </Box>
                                </CardContent>

                                    <CardActions sx={{ p: 3, pt: 0 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<VideoCallIcon />}
                                            onClick={() => routeTo(`/${meeting.meetingCode}`)}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                py: 1.5,
                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                                '&:hover': {
                                                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                                    transform: 'translateY(-2px)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            Rejoin Meeting
                                        </Button>
                                    </CardActions>
                            </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
