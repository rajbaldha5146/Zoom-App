import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Box, Container, Typography, Paper, Card, CardContent } from '@mui/material';
import { Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';
import { useNavigate } from 'react-router-dom';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    let [videos, setVideos] = useState([]);

    let videoRef = useRef([]);

    const navigate = useNavigate();

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        console.log("HELLO")
        getPermissions();

        // Cleanup function
        return () => {
            // Close all peer connections
            for (let id in connections) {
                connections[id].close();
                delete connections[id];
            }
            
            // Close the socket
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            
            // Stop all tracks in the local stream
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }


    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let toggleVideo = () => {
        if (videoAvailable) {
            // Stop all video tracks
            window.localStream.getVideoTracks().forEach(track => track.stop());
            
            // Create black video placeholder
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoref.current.srcObject = window.localStream;
        } else {
            // Restart video stream
            getUserMedia();
        }
        
        setVideoAvailable(!videoAvailable);
    }

    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        if (screen) {
            // Currently sharing, so we want to stop
            // Stop the screen sharing tracks
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
            // Immediately revert to user media (camera and microphone)
            getUserMedia();
        }
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        navigate("/home");
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    // Create a dark theme
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#667eea',
            },
            background: {
                default: '#121212',
                paper: '#1e1e1e',
            },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '8px 16px',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 8,
                        },
                    },
                },
            },
        },
    });

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                color: 'text.primary',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 3, md: 4 },
            }}>

            {askForUsername === true ? (
                <Card sx={{
                    p: { xs: 3, sm: 4 },
                    width: '100%',
                    maxWidth: 500,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    borderRadius: 3,
                }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ 
                        fontWeight: 700,
                        mb: 4,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Join Meeting
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                        <video 
                            ref={localVideoref} 
                            autoPlay 
                            muted
                            style={{
                                width: '100%',
                                maxWidth: 400,
                                height: 225,
                                borderRadius: 12,
                                backgroundColor: '#000',
                                margin: '0 auto',
                                display: 'block'
                            }}
                        />
                    </Box>
                    
                    <TextField 
                        fullWidth
                        label="Your Name" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        variant="outlined" 
                        margin="normal"
                        sx={{ mb: 3 }}
                    />
                    
                    <Button 
                        fullWidth 
                        variant="contained" 
                        onClick={connect}
                        size="large"
                        disabled={!username.trim()}
                        sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Join Meeting
                    </Button>
                </Card>
            ) : (


                <Box sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    bgcolor: 'background.default',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>

                    {showModal && (
                        <Box sx={{
                            position: 'fixed',
                            bottom: 80,
                            right: 20,
                            width: 320,
                            height: 400,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1000,
                            overflow: 'hidden',
                        }}>
                            <Box sx={{
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                bgcolor: 'primary.main',
                                color: 'white',
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Chat</Typography>
                                <IconButton size="small" onClick={closeChat} sx={{ color: 'white' }}>
                                    ✕
                                </IconButton>
                            </Box>
                            <Box sx={{
                                flex: 1,
                                p: 2,
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: '3px',
                                },
                            }}>
                                {messages.length > 0 ? (
                                    messages.map((item, index) => (
                                        <Box key={index} sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                {item.sender}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.primary', wordBreak: 'break-word' }}>
                                                {item.data}
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Box sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: 'text.secondary',
                                        textAlign: 'center',
                                        p: 2
                                    }}>
                                        <Typography>No messages yet. Say hello! 👋</Typography>
                                    </Box>
                                )}
                            </Box>
                            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Type a message..."
                                        value={message}
                                        onChange={handleMessage}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '& fieldset': {
                                                    borderColor: 'rgba(255,255,255,0.1)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'primary.main',
                                                },
                                            },
                                        }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        onClick={sendMessage}
                                        disabled={!message.trim()}
                                        sx={{
                                            minWidth: 'auto',
                                            px: 2,
                                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                            '&:hover': {
                                                transform: 'translateY(-1px)',
                                            },
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        Send
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}


                    <Box sx={{
                        position: 'fixed',
                        bottom: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 1,
                        bgcolor: 'rgba(30, 30, 30, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 50,
                        p: 1,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        zIndex: 100,
                    }}>
                        <IconButton 
                            onClick={toggleVideo} 
                            sx={{ 
                                color: videoAvailable ? 'white' : '#ff4444',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                                width: 48,
                                height: 48,
                            }}
                        >
                            {videoAvailable ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        
                        <IconButton 
                            onClick={handleAudio} 
                            sx={{ 
                                color: audio ? 'white' : '#ff4444',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                                width: 48,
                                height: 48,
                            }}
                        >
                            {audio ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable && (
                            <IconButton 
                                onClick={handleScreen} 
                                sx={{ 
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        bgcolor: screen ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                                        transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                    width: 48,
                                    height: 48,
                                }}
                            >
                                {screen ? <StopScreenShareIcon sx={{ color: '#ff4444' }} /> : <ScreenShareIcon />}
                            </IconButton>
                        )}

                        <Badge 
                            badgeContent={newMessages} 
                            max={999} 
                            color="error"
                            sx={{ 
                                '& .MuiBadge-badge': {
                                    top: 5,
                                    right: 5,
                                    border: '2px solid #1e1e1e',
                                    padding: '0 4px',
                                },
                            }}
                        >
                            <IconButton 
                                onClick={() => setModal(!showModal)} 
                                sx={{ 
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                    width: 48,
                                    height: 48,
                                }}
                            >
                                <ChatIcon />
                            </IconButton>
                        </Badge>

                        <IconButton 
                            onClick={handleEndCall} 
                            sx={{ 
                                color: 'white',
                                bgcolor: '#ff4444',
                                '&:hover': {
                                    bgcolor: '#ff0000',
                                    transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                                width: 48,
                                height: 48,
                                ml: 1,
                            }}
                        >
                            <CallEndIcon />
                        </IconButton>
                    </Box>


                    <Box
                        sx={{
                            position: 'absolute',
                            right: 20,
                            top: 20,
                            width: 180,
                            height: 120,
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            border: '2px solid rgba(255,255,255,0.2)',
                            zIndex: 100,
                            '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <video
                            ref={localVideoref}
                            autoPlay
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                backgroundColor: '#000',
                            }}
                        />
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 1,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                            color: 'white',
                            fontSize: '0.75rem',
                            textAlign: 'left',
                            pl: 1.5,
                        }}>
                            {username || 'You'}
                        </Box>
                    </Box>

                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                        position: 'relative',
                    }}>
                        {videos.length === 0 ? (
                            <Box sx={{
                                textAlign: 'center',
                                color: 'text.secondary',
                                maxWidth: 500,
                                p: 4,
                            }}>
                                <Box sx={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                }}>
                                    <VideocamIcon sx={{ fontSize: 50, color: 'primary.main' }} />
                                </Box>
                                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                                    Waiting for participants
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                                    Share the meeting link with others to invite them to join
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    color="primary"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        // You might want to add a snackbar/toast here
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        px: 3,
                                        py: 1,
                                    }}
                                >
                                    Copy meeting link
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{
                                width: '100%',
                                height: '100%',
                                maxWidth: '90vw',
                                maxHeight: '80vh',
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                position: 'relative',
                            }}>
                                <video
                                    data-socket={videos[0].socketId}
                                    ref={ref => {
                                        if (ref && videos[0].stream) {
                                            ref.srcObject = videos[0].stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        backgroundColor: '#000',
                                    }}
                                />
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    p: 2,
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                    color: 'white',
                                }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {videos[0].socketId === socketIdRef.current ? 'You' : 'Participant'}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    </ThemeProvider>
  );
};
