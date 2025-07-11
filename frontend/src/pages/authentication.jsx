import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';

// Custom theme with modern colors
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8b9df0',
      dark: '#4a5fd8',
    },
    secondary: {
      main: '#764ba2',
      light: '#9a6bb8',
      dark: '#5a3a7a',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#1a1a1a',
    },
    body1: {
      color: '#666',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '12px 24px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: '#667eea',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#667eea',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          borderRadius: 20,
        },
      },
    },
  },
});

export default function Authentication() {
    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                let result = await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
            }
        } catch (err) {
            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    };

    const handleFormStateChange = (event, newFormState) => {
        if (newFormState !== null) {
            setFormState(newFormState);
            setError("");
        }
    };

    return (
        <ThemeProvider theme={customTheme}>
            <Grid container component="main" sx={{ 
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <CssBaseline />
                
                {/* Background Pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url(https://source.unsplash.com/random?technology)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.1,
                        zIndex: 1,
                    }}
                />
                
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        textAlign: 'center',
                        padding: 4,
                    }}
                >
                    <Box sx={{ maxWidth: 500 }}>
                        <VideoCallIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
                        <Typography variant="h3" component="h1" sx={{ 
                            fontWeight: 800, 
                            mb: 2,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            Welcome to Apna Video Call
                        </Typography>
                        <Typography variant="h6" sx={{ 
                            opacity: 0.9,
                            lineHeight: 1.6,
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                            Connect with your loved ones through high-quality video calls. 
                            Experience seamless communication with our modern platform.
                        </Typography>
                    </Box>
                </Grid>
                
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square 
                    sx={{ 
                        position: 'relative',
                        zIndex: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                    }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <Avatar sx={{ 
                            m: 1, 
                            bgcolor: 'primary.main',
                            width: 64,
                            height: 64,
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                        }}>
                            <LockOutlinedIcon sx={{ fontSize: 32 }} />
                        </Avatar>

                        <Typography component="h1" variant="h4" sx={{ 
                            mb: 3,
                            fontWeight: 700,
                            textAlign: 'center'
                        }}>
                            {formState === 0 ? 'Sign In' : 'Create Account'}
                        </Typography>

                        {/* Toggle Buttons */}
                        <ToggleButtonGroup
                            value={formState}
                            exclusive
                            onChange={handleFormStateChange}
                            sx={{ 
                                mb: 3,
                                '& .MuiToggleButton-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 12,
                                    px: 3,
                                    py: 1,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                    },
                                },
                            }}
                        >
                            <ToggleButton value={0}>Sign In</ToggleButton>
                            <ToggleButton value={1}>Sign Up</ToggleButton>
                        </ToggleButtonGroup>

                        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Full Name"
                                    name="name"
                                    value={name}
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus={formState === 0}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                sx={{ mb: 2 }}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ 
                                    mt: 3, 
                                    mb: 2,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Sign In" : "Create Account"}
                            </Button>

                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {formState === 0 ? "Don't have an account? " : "Already have an account? "}
                                    <Link
                                        component="button"
                                        variant="body2"
                                        onClick={() => {
                                            setFormState(formState === 0 ? 1 : 0);
                                            setError("");
                                        }}
                                        sx={{ 
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            }
                                        }}
                                    >
                                        {formState === 0 ? "Sign Up" : "Sign In"}
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setOpen(false)} 
                    severity="success" 
                    sx={{ width: '100%' }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}