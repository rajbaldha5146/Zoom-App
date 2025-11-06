import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import server from '../environment';
import styles from '../styles/videoComponent.module.css';

// WebRTC configuration
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

const VideoMeet = () => {
    // Basic state
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [username, setUsername] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState('checking');
    
    // Screen sharing state
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [screenStream, setScreenStream] = useState(null);
    const [remoteScreenShare, setRemoteScreenShare] = useState(null);
    const [originalStream, setOriginalStream] = useState(null);
    
    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Refs
    const localVideoRef = useRef(null);
    const socketRef = useRef(null);
    const peersRef = useRef({});
    const roomId = window.location.pathname.slice(1);
    
    const navigate = useNavigate();

    // Check permissions
    const checkPermissions = async () => {
        try {
            const permissions = await Promise.all([
                navigator.permissions.query({ name: 'camera' }),
                navigator.permissions.query({ name: 'microphone' })
            ]);
            
            const [cameraPermission, micPermission] = permissions;
            console.log('Camera permission:', cameraPermission.state);
            console.log('Microphone permission:', micPermission.state);
            
            if (cameraPermission.state === 'granted' && micPermission.state === 'granted') {
                setPermissionStatus('granted');
                return true;
            } else if (cameraPermission.state === 'denied' || micPermission.state === 'denied') {
                setPermissionStatus('denied');
                return false;
            } else {
                setPermissionStatus('prompt');
                return true; // Will prompt when getUserMedia is called
            }
        } catch (error) {
            console.log('Permission API not supported, will try getUserMedia directly');
            setPermissionStatus('unknown');
            return true;
        }
    };

    // Initialize media stream
    const initializeMedia = async () => {
        try {
            console.log('Requesting camera and microphone access...');
            
            // Start with simple, reliable constraints
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                },
                audio: true
            });
            
            console.log('Media stream obtained:', stream);
            console.log('Video tracks:', stream.getVideoTracks());
            console.log('Audio tracks:', stream.getAudioTracks());
            
            setLocalStream(stream);
            
            // Ensure video element gets the stream with multiple attempts
            if (localVideoRef.current) {
                console.log('Assigning stream to video element');
                localVideoRef.current.srcObject = stream;
                
                // Wait a bit then force play
                setTimeout(() => {
                    if (localVideoRef.current) {
                        localVideoRef.current.load();
                        localVideoRef.current.play().then(() => {
                            console.log('Video playing after timeout');
                        }).catch(e => {
                            console.log('Video play failed after timeout:', e);
                            // Try one more time
                            setTimeout(() => {
                                if (localVideoRef.current) {
                                    localVideoRef.current.play().catch(console.error);
                                }
                            }, 500);
                        });
                    }
                }, 100);
            }
            
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            
            // Try with simpler constraints
            try {
                console.log('Trying with basic constraints...');
                const fallbackStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                
                console.log('Fallback stream obtained:', fallbackStream);
                setLocalStream(fallbackStream);
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = fallbackStream;
                    localVideoRef.current.play().catch(e => console.log('Fallback video play failed:', e));
                }
                
                return fallbackStream;
            } catch (fallbackError) {
                console.error('Fallback media access failed:', fallbackError);
                alert('Camera and microphone access is required. Please check your browser permissions.');
                throw new Error('Camera and microphone access is required to join the meeting');
            }
        }
    };

    // Create peer connection
    const createPeerConnection = (socketId) => {
        console.log('Creating peer connection for:', socketId);
        const peerConnection = new RTCPeerConnection(iceServers);
        
        // Add local stream to peer connection
        if (localStream) {
            console.log('Adding local stream tracks to peer connection');
            localStream.getTracks().forEach(track => {
                console.log('Adding track:', track.kind, track.enabled);
                peerConnection.addTrack(track, localStream);
            });
        } else {
            console.warn('No local stream available when creating peer connection');
        }
        
        // Handle remote stream
        peerConnection.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            const [remoteStream] = event.streams;
            console.log('Remote stream received:', remoteStream);
            
            // Check if this is a screen share (larger resolution usually indicates screen share)
            const videoTrack = remoteStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.onloadedmetadata = () => {
                    const { width, height } = videoTrack.getSettings();
                    const isScreenShare = width > 1000 || height > 700; // Screen shares are usually larger
                    
                    if (isScreenShare) {
                        console.log('Detected remote screen share');
                        setRemoteScreenShare({ id: socketId, stream: remoteStream });
                    } else {
                        setRemoteStreams(prev => {
                            const exists = prev.find(stream => stream.id === socketId);
                            if (!exists) {
                                console.log('Adding new remote video stream for:', socketId);
                                return [...prev, { id: socketId, stream: remoteStream }];
                            }
                            return prev;
                        });
                    }
                };
            }
            
            // Fallback: add to regular streams if we can't determine
            setRemoteStreams(prev => {
                const exists = prev.find(stream => stream.id === socketId);
                if (!exists) {
                    console.log('Adding new remote stream for:', socketId);
                    return [...prev, { id: socketId, stream: remoteStream }];
                }
                return prev;
            });
        };
        
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                console.log('Sending ICE candidate to:', socketId);
                socketRef.current.emit('signal', socketId, JSON.stringify({
                    ice: event.candidate
                }));
            } else if (!event.candidate) {
                console.log('ICE gathering complete for:', socketId);
            }
        };
        
        // Connection state monitoring
        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state for ${socketId}:`, peerConnection.connectionState);
        };
        
        peerConnection.oniceconnectionstatechange = () => {
            console.log(`ICE connection state for ${socketId}:`, peerConnection.iceConnectionState);
        };
        
        peersRef.current[socketId] = peerConnection;
        return peerConnection;
    };

    // Handle socket signals
    const handleSignal = async (fromId, message) => {
        try {
            console.log('Received signal from:', fromId);
            const signal = JSON.parse(message);
            console.log('Signal type:', signal.sdp?.type || 'ice-candidate');
            
            let peerConnection = peersRef.current[fromId];
            
            if (!peerConnection) {
                console.log('Creating new peer connection for signal from:', fromId);
                peerConnection = createPeerConnection(fromId);
            }
            
            if (signal.sdp) {
                console.log('Processing SDP:', signal.sdp.type);
                await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                
                if (signal.sdp.type === 'offer') {
                    console.log('Creating answer for offer from:', fromId);
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    
                    console.log('Sending answer to:', fromId);
                    socketRef.current.emit('signal', fromId, JSON.stringify({
                        sdp: peerConnection.localDescription
                    }));
                }
            }
            
            if (signal.ice) {
                console.log('Adding ICE candidate from:', fromId);
                await peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
            }
        } catch (error) {
            console.error('Error handling signal from', fromId, ':', error);
        }
    };

    // Initialize socket connection
    const initializeSocket = () => {
        socketRef.current = io(server, { secure: false });
        
        socketRef.current.on('connect', () => {
            console.log('Connected to server');
            socketRef.current.emit('join-call', window.location.href);
        });
        
        socketRef.current.on('user-joined', async (socketId, clients) => {
            console.log('User joined:', socketId, 'Total clients:', clients);
            
            // Don't create connection to ourselves
            if (socketId === socketRef.current.id) {
                console.log('Ignoring self connection');
                return;
            }
            
            // Create peer connection for new user
            const peerConnection = createPeerConnection(socketId);
            
            // Only create offer if we have local stream
            if (localStream) {
                try {
                    console.log('Creating offer for:', socketId);
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);
                    
                    console.log('Sending offer to:', socketId);
                    socketRef.current.emit('signal', socketId, JSON.stringify({
                        sdp: peerConnection.localDescription
                    }));
                } catch (error) {
                    console.error('Error creating offer:', error);
                }
            } else {
                console.warn('No local stream available for offer creation');
            }
        });
        
        socketRef.current.on('user-left', (socketId) => {
            console.log('User left:', socketId);
            
            // Close peer connection
            if (peersRef.current[socketId]) {
                peersRef.current[socketId].close();
                delete peersRef.current[socketId];
            }
            
            // Remove remote stream
            setRemoteStreams(prev => prev.filter(stream => stream.id !== socketId));
        });
        
        socketRef.current.on('signal', handleSignal);
        
        // Handle incoming chat messages
        socketRef.current.on('chat-message', (messageData) => {
            console.log('Received chat message:', messageData);
            const incomingMessage = {
                id: Date.now() + Math.random(),
                text: messageData.text,
                sender: messageData.sender,
                timestamp: messageData.timestamp,
                isOwn: false
            };
            
            setMessages(prev => [...prev, incomingMessage]);
            
            // Increment unread count if chat is closed
            if (!isChatOpen) {
                setUnreadCount(prev => prev + 1);
            }
        });
    };

    // Join meeting
    const joinMeeting = async () => {
        if (!username.trim()) {
            alert('Please enter your name');
            return;
        }

        setIsConnecting(true);
        
        try {
            // Ensure we have a fresh stream
            let stream = localStream;
            if (!stream) {
                console.log('Getting fresh media stream for meeting');
                stream = await initializeMedia();
            }
            
            if (stream) {
                console.log('Stream ready, joining meeting with tracks:', stream.getTracks().length);
                setHasJoined(true);
                
                // Small delay to ensure state is updated
                setTimeout(() => {
                    initializeSocket();
                }, 100);
            } else {
                throw new Error('Failed to get media stream');
            }
        } catch (error) {
            console.error('Error joining meeting:', error);
            alert('Failed to join meeting. Please check your camera and microphone permissions.');
        } finally {
            setIsConnecting(false);
        }
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

    // Toggle audio
    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
            }
        }
    };

    // Start screen sharing
    const startScreenShare = async () => {
        try {
            console.log('Starting screen share...');
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            
            // Store original camera stream
            setOriginalStream(localStream);
            setScreenStream(screenStream);
            setIsScreenSharing(true);
            
            // Replace video track in all peer connections
            const videoTrack = screenStream.getVideoTracks()[0];
            Object.values(peersRef.current).forEach(peerConnection => {
                const sender = peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });
            
            // Update local video display
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
            }
            
            // Handle screen share end
            videoTrack.onended = () => {
                stopScreenShare();
            };
            
            console.log('Screen sharing started');
        } catch (error) {
            console.error('Error starting screen share:', error);
            alert('Failed to start screen sharing. Please try again.');
        }
    };

    // Stop screen sharing
    const stopScreenShare = async () => {
        try {
            console.log('Stopping screen share...');
            
            if (screenStream) {
                screenStream.getTracks().forEach(track => track.stop());
            }
            
            setIsScreenSharing(false);
            setScreenStream(null);
            
            // Restore original camera stream
            if (originalStream) {
                const videoTrack = originalStream.getVideoTracks()[0];
                Object.values(peersRef.current).forEach(peerConnection => {
                    const sender = peerConnection.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    );
                    if (sender && videoTrack) {
                        sender.replaceTrack(videoTrack);
                    }
                });
                
                // Update local video display
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = originalStream;
                }
            }
            
            console.log('Screen sharing stopped');
        } catch (error) {
            console.error('Error stopping screen share:', error);
        }
    };

    // Toggle screen sharing
    const toggleScreenShare = () => {
        if (isScreenSharing) {
            stopScreenShare();
        } else {
            startScreenShare();
        }
    };

    // Chat functions
    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) {
            setUnreadCount(0); // Clear unread count when opening chat
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !socketRef.current) return;
        
        const messageData = {
            id: Date.now(),
            text: newMessage.trim(),
            sender: username,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: true
        };
        
        // Add to local messages
        setMessages(prev => [...prev, messageData]);
        
        // Send to other participants
        socketRef.current.emit('chat-message', {
            text: newMessage.trim(),
            sender: username,
            timestamp: messageData.timestamp
        });
        
        setNewMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Leave meeting
    const leaveMeeting = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
        }
        
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        
        navigate('/home');
    };

    // Initialize preview on component mount
    useEffect(() => {
        const init = async () => {
            await checkPermissions();
            if (!hasJoined) {
                initializeMedia().catch(console.error);
            }
        };
        init();
    }, []);

    // Update video element when localStream changes
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            console.log('Setting video srcObject:', localStream);
            console.log('Video tracks in stream:', localStream.getVideoTracks());
            localVideoRef.current.srcObject = localStream;
            
            // Force video to load and play
            localVideoRef.current.load();
            localVideoRef.current.play().then(() => {
                console.log('Video playing successfully');
            }).catch(error => {
                console.error('Video play error:', error);
            });
        }
    }, [localStream, hasJoined]); // Also trigger when joining meeting

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            
            // Clean up all peer connections
            Object.values(peersRef.current).forEach(peer => {
                peer.close();
            });
        };
    }, [localStream]);

    if (!hasJoined) {
        return (
            <div className={styles.joinContainer}>
                <div className={styles.joinCard}>
                    <h2>Join Meeting</h2>
                    <p className={styles.roomId}>Room: {roomId}</p>
                    
                    <div className={styles.previewContainer}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            controls={false}
                            className={styles.previewVideo}
                            onLoadedMetadata={() => {
                                console.log('Video metadata loaded');
                                console.log('Video dimensions:', localVideoRef.current?.videoWidth, 'x', localVideoRef.current?.videoHeight);
                            }}
                            onCanPlay={() => {
                                console.log('Video can play');
                                localVideoRef.current?.play();
                            }}
                            onPlay={() => console.log('Video started playing')}
                            onError={(e) => console.error('Video error:', e)}
                            onLoadStart={() => console.log('Video load started')}
                        />
                        <div className={styles.cameraStatus}>
                            {!localStream && permissionStatus === 'checking' && <p>🔍 Checking permissions...</p>}
                            {!localStream && permissionStatus === 'denied' && <p>❌ Camera access denied</p>}
                            {!localStream && permissionStatus === 'prompt' && <p>🎥 Click "Test Camera" to allow access</p>}
                            {!localStream && permissionStatus === 'granted' && <p>🎥 Initializing camera...</p>}
                            {localStream && (
                                <div>
                                    <p>✅ Camera ready</p>
                                    <button 
                                        onClick={() => {
                                            if (localVideoRef.current) {
                                                console.log('Manual video play attempt');
                                                localVideoRef.current.play().catch(console.error);
                                            }
                                        }}
                                        style={{fontSize: '10px', padding: '2px 6px', marginTop: '4px'}}
                                    >
                                        ▶️ Play
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && joinMeeting()}
                        className={styles.nameInput}
                    />
                    
                    <div className={styles.buttonGroup}>
                        {!localStream && (
                            <div>
                                <button 
                                    onClick={async () => {
                                        try {
                                            console.log('Testing camera with minimal constraints...');
                                            const testStream = await navigator.mediaDevices.getUserMedia({ 
                                                video: true, 
                                                audio: false 
                                            });
                                            console.log('Test stream obtained:', testStream);
                                            
                                            if (localVideoRef.current) {
                                                localVideoRef.current.srcObject = testStream;
                                                await localVideoRef.current.play();
                                                console.log('Test video playing');
                                            }
                                            
                                            setLocalStream(testStream);
                                        } catch (error) {
                                            console.error('Test camera failed:', error);
                                            if (error.message.includes('in use')) {
                                                alert('Camera is in use by another tab/app. Please close other video apps or use a different device to test.');
                                            } else {
                                                alert('Camera test failed: ' + error.message);
                                            }
                                        }
                                    }}
                                    className={styles.testButton}
                                >
                                    🎥 Test Camera
                                </button>
                                
                                <button 
                                    onClick={async () => {
                                        try {
                                            console.log('Creating fake video stream...');
                                            // Create a fake video stream for testing
                                            const canvas = document.createElement('canvas');
                                            canvas.width = 640;
                                            canvas.height = 480;
                                            const ctx = canvas.getContext('2d');
                                            
                                            // Draw a simple pattern
                                            const drawFrame = () => {
                                                ctx.fillStyle = `hsl(${Date.now() / 10 % 360}, 50%, 50%)`;
                                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                                ctx.fillStyle = 'white';
                                                ctx.font = '30px Arial';
                                                ctx.textAlign = 'center';
                                                ctx.fillText('FAKE CAMERA', canvas.width/2, canvas.height/2);
                                                ctx.fillText(new Date().toLocaleTimeString(), canvas.width/2, canvas.height/2 + 40);
                                            };
                                            
                                            // Animate the fake video
                                            setInterval(drawFrame, 100);
                                            drawFrame();
                                            
                                            const fakeStream = canvas.captureStream(30);
                                            console.log('Fake stream created:', fakeStream);
                                            
                                            if (localVideoRef.current) {
                                                localVideoRef.current.srcObject = fakeStream;
                                                await localVideoRef.current.play();
                                                console.log('Fake video playing');
                                            }
                                            
                                            setLocalStream(fakeStream);
                                        } catch (error) {
                                            console.error('Fake camera failed:', error);
                                            alert('Fake camera failed: ' + error.message);
                                        }
                                    }}
                                    className={styles.testButton}
                                    style={{marginTop: '5px', background: '#ff9800'}}
                                >
                                    🎨 Use Fake Camera
                                </button>
                                
                                <button 
                                    onClick={async () => {
                                        try {
                                            console.log('Testing audio only...');
                                            const audioStream = await navigator.mediaDevices.getUserMedia({ 
                                                video: false, 
                                                audio: true 
                                            });
                                            
                                            // Create a black video track
                                            const canvas = document.createElement('canvas');
                                            canvas.width = 640;
                                            canvas.height = 480;
                                            const ctx = canvas.getContext('2d');
                                            ctx.fillStyle = 'black';
                                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                                            ctx.fillStyle = 'white';
                                            ctx.font = '20px Arial';
                                            ctx.textAlign = 'center';
                                            ctx.fillText('AUDIO ONLY', canvas.width/2, canvas.height/2);
                                            
                                            const videoStream = canvas.captureStream(1);
                                            
                                            // Combine audio and fake video
                                            const combinedStream = new MediaStream([
                                                ...audioStream.getAudioTracks(),
                                                ...videoStream.getVideoTracks()
                                            ]);
                                            
                                            console.log('Audio-only stream created:', combinedStream);
                                            
                                            if (localVideoRef.current) {
                                                localVideoRef.current.srcObject = combinedStream;
                                                await localVideoRef.current.play();
                                                console.log('Audio-only video playing');
                                            }
                                            
                                            setLocalStream(combinedStream);
                                        } catch (error) {
                                            console.error('Audio-only failed:', error);
                                            alert('Audio-only failed: ' + error.message);
                                        }
                                    }}
                                    className={styles.testButton}
                                    style={{marginTop: '5px', background: '#2196f3'}}
                                >
                                    🎵 Audio Only
                                </button>
                            </div>
                        )}
                        
                        <button 
                            onClick={joinMeeting}
                            className={styles.joinButton}
                            disabled={!username.trim() || isConnecting}
                        >
                            {isConnecting ? 'Connecting...' : 'Join Meeting'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.meetingContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.meetingInfo}>
                    <h3>Meeting: {roomId}</h3>
                    <span className={styles.participantCount}>
                        {remoteStreams.length + 1} participant{remoteStreams.length !== 0 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Video Area */}
            <div className={`${styles.videoArea} ${(isScreenSharing || remoteScreenShare) ? styles.screenShareMode : ''} ${remoteStreams.length === 1 && !isScreenSharing && !remoteScreenShare ? styles.twoParticipants : ''}`}>
                {/* Main content area */}
                <div className={styles.mainContent}>
                    {/* Screen share display */}
                    {(isScreenSharing || remoteScreenShare) ? (
                        <div className={styles.screenShareContainer}>
                            <div className={styles.screenShareHeader}>
                                <h3>
                                    {isScreenSharing ? 'You are sharing your screen' : 'Screen shared by participant'}
                                </h3>
                                {isScreenSharing && (
                                    <button onClick={stopScreenShare} className={styles.stopShareButton}>
                                        Stop Sharing
                                    </button>
                                )}
                            </div>
                            <video
                                autoPlay
                                playsInline
                                ref={isScreenSharing ? localVideoRef : null}
                                className={styles.screenShareVideo}
                                {...(remoteScreenShare && {
                                    ref: (ref) => {
                                        if (ref && remoteScreenShare.stream) {
                                            ref.srcObject = remoteScreenShare.stream;
                                        }
                                    }
                                })}
                            />
                        </div>
                    ) : (
                        /* Regular video grid when no screen sharing */
                        <div className={styles.remoteVideos}>
                            {remoteStreams.length === 0 ? (
                                <div className={styles.waitingMessage}>
                                    <h3>Waiting for others to join...</h3>
                                    <p>Share this room code: <strong>{roomId}</strong></p>
                                </div>
                            ) : (
                                <div className={`${styles.videoGrid} ${styles[`participants${remoteStreams.length}`]}`}>
                                    {remoteStreams.map((streamData, index) => (
                                        <div key={streamData.id} className={styles.remoteVideoContainer}>
                                            <video
                                                autoPlay
                                                playsInline
                                                ref={(ref) => {
                                                    if (ref && streamData.stream) {
                                                        ref.srcObject = streamData.stream;
                                                    }
                                                }}
                                                className={styles.remoteVideo}
                                            />
                                            <div className={styles.videoLabel}>
                                                Participant {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar for participant videos during screen share */}
                {(isScreenSharing || remoteScreenShare) && (
                    <div className={styles.participantSidebar}>
                        <h4>Participants</h4>
                        <div className={styles.sidebarVideos}>
                            {/* Local video thumbnail */}
                            {!isScreenSharing && (
                                <div className={styles.sidebarVideoItem}>
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className={styles.sidebarVideo}
                                    />
                                    <span className={styles.sidebarLabel}>You</span>
                                </div>
                            )}
                            
                            {/* Remote video thumbnails */}
                            {remoteStreams.map((streamData, index) => (
                                <div key={streamData.id} className={styles.sidebarVideoItem}>
                                    <video
                                        autoPlay
                                        playsInline
                                        ref={(ref) => {
                                            if (ref && streamData.stream) {
                                                ref.srcObject = streamData.stream;
                                            }
                                        }}
                                        className={styles.sidebarVideo}
                                    />
                                    <span className={styles.sidebarLabel}>Participant {index + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Local video section (only when not screen sharing) */}
                {!(isScreenSharing || remoteScreenShare) && (
                    <div className={styles.localVideoContainer}>
                        <div className={styles.localVideoHeader}>
                            <h4>You ({username})</h4>
                            <button 
                                onClick={() => {
                                    if (localVideoRef.current && localStream) {
                                        console.log('Refreshing local video');
                                        localVideoRef.current.srcObject = localStream;
                                        localVideoRef.current.play().catch(console.error);
                                    }
                                }}
                                className={styles.refreshButton}
                            >
                                🔄
                            </button>
                        </div>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className={styles.localVideo}
                            onLoadedMetadata={() => console.log('Local video metadata loaded in meeting')}
                            onPlay={() => console.log('Local video playing in meeting')}
                        />
                    </div>
                )}
            </div>

            {/* Chat Panel */}
            {isChatOpen && (
                <div className={styles.chatPanel}>
                    <div className={styles.chatHeader}>
                        <h3>Chat</h3>
                        <button onClick={toggleChat} className={styles.closeChatButton}>
                            ✕
                        </button>
                    </div>
                    
                    <div className={styles.chatMessages}>
                        {messages.length === 0 ? (
                            <div className={styles.emptyChatMessage}>
                                <p>💬 No messages yet</p>
                                <p>Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className={`${styles.chatMessage} ${msg.isOwn ? styles.ownMessage : styles.otherMessage}`}
                                >
                                    <div className={styles.messageHeader}>
                                        <span className={styles.messageSender}>
                                            {msg.isOwn ? 'You' : msg.sender}
                                        </span>
                                        <span className={styles.messageTime}>{msg.timestamp}</span>
                                    </div>
                                    <div className={styles.messageText}>{msg.text}</div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className={styles.chatInput}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className={styles.messageInput}
                            maxLength={500}
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className={styles.sendButton}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className={styles.controls}>
                <button
                    onClick={toggleAudio}
                    className={`${styles.controlButton} ${isAudioOn ? styles.active : styles.inactive}`}
                    title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                    <span className={styles.icon}>{isAudioOn ? '🎤' : '🔇'}</span>
                    <span className={styles.label}>{isAudioOn ? 'Mic' : 'Muted'}</span>
                </button>

                <button
                    onClick={toggleVideo}
                    className={`${styles.controlButton} ${isVideoOn ? styles.active : styles.inactive}`}
                    title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                >
                    <span className={styles.icon}>{isVideoOn ? '📹' : '📷'}</span>
                    <span className={styles.label}>{isVideoOn ? 'Camera' : 'Off'}</span>
                </button>

                <button
                    onClick={toggleScreenShare}
                    className={`${styles.controlButton} ${isScreenSharing ? styles.sharing : ''}`}
                    title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
                >
                    <span className={styles.icon}>{isScreenSharing ? '🛑' : '📺'}</span>
                    <span className={styles.label}>{isScreenSharing ? 'Stop Share' : 'Share'}</span>
                </button>

                <button
                    onClick={toggleChat}
                    className={`${styles.controlButton} ${isChatOpen ? styles.active : ''}`}
                    title="Toggle chat"
                >
                    <span className={styles.icon}>💬</span>
                    <span className={styles.label}>Chat</span>
                    {unreadCount > 0 && (
                        <span className={styles.chatBadge}>{unreadCount}</span>
                    )}
                </button>

                <button
                    onClick={leaveMeeting}
                    className={`${styles.controlButton} ${styles.endCall}`}
                    title="Leave meeting"
                >
                    <span className={styles.icon}>📞</span>
                    <span className={styles.label}>Leave</span>
                </button>
            </div>
        </div>
    );
};

export default VideoMeet;