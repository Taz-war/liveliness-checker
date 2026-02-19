import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { io } from "socket.io-client";
import { 
  Box, Button, Typography, Card, CardContent, Stack, 
  CircularProgress, Alert, TextField 
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { translations } from "../utils/translations";


const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: "user",
};

const LivelinessChecker = ({ currentLang = 'en' }) => {
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const t = translations[currentLang];
  
  const [step, setStep] = useState(0); 
  const [imgSrc, setImgSrc] = useState(null);
  const [username, setUsername] = useState("");
  const [primaryInfo, setPrimaryInfo] = useState(""); 
  const [secondaryInfo, setSecondaryInfo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setStep(1);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setStep(0);
    setPrimaryInfo("");
    setSecondaryInfo("");
  };

  const handleStartLiveliness = async () => {
    setIsProcessing(true);
    setPrimaryInfo(t.uploading);

    try {
        const uploadData = { status: 'success', user_uuid: 'mock-user-uuid-123' };
        if (uploadData.status === 'success') {
            setStep(2);
            await initiateLivelinessSequence(username, uploadData.user_uuid);
        }
    } catch (error) {
        setPrimaryInfo(t.upload_fail);
    } finally {
        setIsProcessing(false);
    }
  };

  const initiateLivelinessSequence = async (user, userUUID) => {
    try {
        setPrimaryInfo(t.connecting);
        const tokenData = { 
            token: "mock-jwt-token", 
            server_url: "http://localhost:5000",
            client_uuid: "mock-client-uuid",
            user_uuid: userUUID 
        };
        connectSocket(tokenData);
    } catch (e) {
        setPrimaryInfo("Could not start liveliness check.");
    }
  };

  const connectSocket = ({ token, server_url, client_uuid, user_uuid }) => {
    const socket = io(server_url, { query: { token, client_uuid, user_uuid }, transports: ['websocket'] });
    socketRef.current = socket;

    socket.on("connect", () => {
        setPrimaryInfo(t.connected);
        setSecondaryInfo(t.look_camera);
    });

    socket.on("server_command", (command) => {
        if (["send_face_frame", "send_emotion_frame", "send_blinking_frame"].includes(command)) {
            setTimeout(() => captureAndEmitFrame(command, socket, client_uuid, user_uuid), 100);
        }
        if (command === "disconnect") socket.disconnect();
    });

    socket.on("emotion_recognition", (msg) => setSecondaryInfo(msg));
    socket.on("blink_recognition", (msg) => setSecondaryInfo(msg));
    socket.on("emotion_recognition_success", (msg) => setSecondaryInfo(`✅ ${msg}`));
    socket.on("blink_recognition_success", (msg) => setSecondaryInfo(`✅ ${msg}`));
    socket.on("auth_failed", (msg) => {
        setPrimaryInfo(`❌ ${t.auth_failed}: ${msg}`);
        socket.disconnect();
    });
    socket.on("auth_complete", async () => {
        setPrimaryInfo(`✅ ${t.auth_complete}`);
        socket.disconnect();
        setStep(3);
    });
  };

  const captureAndEmitFrame = (type, socket, client_uuid, user_uuid) => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (type === "send_face_frame") socket.emit("face_frame_data", imageSrc, client_uuid, user_uuid);
    else if (type === "send_emotion_frame") socket.emit("emotion_frame_data", imageSrc);
    else if (type === "send_blinking_frame") socket.emit("blinking_frame_data", imageSrc);
  };

  useEffect(() => {
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  return (
    <Card sx={{ 
        width: '100%', 
        maxWidth: 500, 
        borderRadius: 2, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)' // Subtle, elegant shadow
    }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            {step === 3 ? t.verified : t.title}
        </Typography>

        {step !== 3 && (
            <Box sx={{ 
                position: "relative", 
                width: "100%", 
                height: 380, // slightly smaller height for better proportions
                bgcolor: "#000", 
                borderRadius: 2, 
                overflow: "hidden",
                mb: 3
            }}>
            
            {(step === 0 || step === 2) && (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                />
            )}

            {step === 1 && imgSrc && (
                <img src={imgSrc} alt="Captured" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
            )}

            <Box
                sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 200,
                height: 280,
                border: step === 3 ? "4px solid #4CAF50" : "2px solid rgba(255,255,255,0.8)",
                borderRadius: "50%",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)", // Darkens area outside oval
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
                }}
            >
                {isProcessing && step !== 2 && <CircularProgress color="primary" size={50} />}
            </Box>

            <Box sx={{ position: "absolute", bottom: 20, width: "100%", textAlign: "center", zIndex: 20 }}>
                <Typography variant="h6" sx={{ color: "white", textShadow: "0px 2px 4px rgba(0,0,0,0.8)" }}>
                    {secondaryInfo || (step === 2 ? t.listening : "")}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: "#eee", mt: 1 }}>
                    {primaryInfo}
                </Typography>
            </Box>
            </Box>
        )}

        <Stack spacing={2} alignItems="center">
            {step === 0 && (
                <>
                    <TextField 
                        label={t.username_label} 
                        variant="outlined" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        fullWidth
                    />
                    <Button 
                        variant="contained" 
                        size="large" 
                        startIcon={<CameraAltIcon />} 
                        onClick={capture}
                        sx={{ px: 4, py: 1.5 }} // Make button slightly larger
                    >
                        {t.capture_btn}
                    </Button>
                </>
            )}

            {step === 1 && (
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <Button variant="outlined" color="inherit" onClick={retake} fullWidth>
                        {t.retake_btn}
                    </Button>
                    <Button variant="contained" onClick={handleStartLiveliness} fullWidth>
                        {t.start_btn}
                    </Button>
                </Stack>
            )}

            {step === 2 && (
                <Alert severity="info" sx={{ width: '100%' }}>{t.follow_instructions}</Alert>
            )}

            {step === 3 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                    <Alert severity="success">{t.success_msg}</Alert>
                </Box>
            )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LivelinessChecker;