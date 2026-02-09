import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { io } from "socket.io-client"; // Import Socket.IO
import { Box, Button, Typography, Card, CardContent, Stack, CircularProgress, Alert, TextField } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Configuration for the webcam
const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: "user",
};

const LivelinessChecker = () => {
  const webcamRef = useRef(null);
  const socketRef = useRef(null); // To store the active socket connection

  // UI State
  const [step, setStep] = useState(0); // 0: Capture, 1: Review, 2: Liveliness, 3: Success
  const [imgSrc, setImgSrc] = useState(null);
  const [username, setUsername] = useState("test_user");

  // Liveliness Feedback State (Replaces jQuery html updates)
  const [primaryInfo, setPrimaryInfo] = useState("");
  const [secondaryInfo, setSecondaryInfo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ----------------------------------------------------------------
  // STEP 1: CAPTURE STATIC IMAGE
  // ----------------------------------------------------------------
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setStep(1); // Move to review step
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setStep(0);
    setPrimaryInfo("");
    setSecondaryInfo("");
  };

  // ----------------------------------------------------------------
  // STEP 2: SUBMIT IMAGE & START LIVELINESS
  // ----------------------------------------------------------------
  const handleStartLiveliness = async () => {
    setIsProcessing(true);
    setPrimaryInfo("Uploading image...");

    try {
      // 1. Upload the static image (Mocking your /submit-demo-info-form)
      // In a real app, use FormData here as you did in the PHP script
      /* const formData = new FormData();
        formData.append('image', imgSrc);
        const uploadRes = await fetch('/submit-demo-info-form', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json(); 
        */

      // Mocking the upload response for now
      const uploadData = { status: "success", user_uuid: "mock-user-uuid-123" };

      if (uploadData.status === "success") {
        setStep(2); // Switch UI to Liveliness Mode
        await initiateLivelinessSequence(username, uploadData.user_uuid);
      }
    } catch (error) {
      console.error("Upload failed", error);
      setPrimaryInfo("Upload Failed. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ----------------------------------------------------------------
  // STEP 3: THE LIVELINESS LOGIC (Ported from fida_sdk.js)
  // ----------------------------------------------------------------
  const initiateLivelinessSequence = async (user, userUUID) => {
    try {
      setPrimaryInfo("Connecting to Liveliness Server...");

      // 1. Get Token from Flask (Matches /get-liveliness-token)
      /*
        const tokenRes = await fetch('/get-liveliness-token', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ data: user })
        });
        const tokenData = await tokenRes.json();
        */

      // Mocking the token response
      const tokenData = {
        token: "mock-jwt-token",
        server_url: "http://localhost:5000", // Change this to your real socket server URL
        client_uuid: "mock-client-uuid",
        user_uuid: userUUID,
      };

      // 2. Connect to Socket.IO
      connectSocket(tokenData);
    } catch (e) {
      console.error(e);
      setPrimaryInfo("Could not start liveliness check.");
    }
  };

  const connectSocket = ({ token, server_url, client_uuid, user_uuid }) => {
    // Initialize Socket
    const socket = io(server_url, {
      query: { token, client_uuid, user_uuid },
      transports: ["websocket"], // Force websocket for better performance
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setPrimaryInfo("Connected! Follow instructions below.");
      setSecondaryInfo("Look at the camera");
    });

    // Handle Server Commands (The core SDK logic)
    socket.on("server_command", (command) => {
      if (["send_face_frame", "send_emotion_frame", "send_blinking_frame"].includes(command)) {
        // Wait 100ms then capture (as per original SDK)
        setTimeout(() => captureAndEmitFrame(command, socket, client_uuid, user_uuid), 100);
      }
      if (command === "disconnect") socket.disconnect();
    });

    // Feedback Events
    socket.on("emotion_recognition", (msg) => setSecondaryInfo(msg));
    socket.on("blink_recognition", (msg) => setSecondaryInfo(msg));
    socket.on("emotion_recognition_success", (msg) => setSecondaryInfo(`✅ ${msg}`));
    socket.on("blink_recognition_success", (msg) => setSecondaryInfo(`✅ ${msg}`));

    // Auth Results
    socket.on("auth_failed", (msg) => {
      setPrimaryInfo(`❌ Authentication Failed: ${msg}`);
      socket.disconnect();
    });

    socket.on("auth_complete", async (data) => {
      setPrimaryInfo("✅ Authentication Complete! Verifying...");
      socket.disconnect();

      // 3. Final Verification (Matches /verify-auth-token)
      // await verifyAuthToken(user_uuid, data.auth_token);
      setStep(3); // Success Screen
    });
  };

  // Helper to capture frame from the EXISTING webcam ref and emit it
  const captureAndEmitFrame = (type, socket, client_uuid, user_uuid) => {
    if (!webcamRef.current) return;

    // Use getScreenshot() from react-webcam which returns base64 string
    const imageSrc = webcamRef.current.getScreenshot();

    if (type === "send_face_frame") {
      socket.emit("face_frame_data", imageSrc, client_uuid, user_uuid);
    } else if (type === "send_emotion_frame") {
      socket.emit("emotion_frame_data", imageSrc);
    } else if (type === "send_blinking_frame") {
      socket.emit("blinking_frame_data", imageSrc);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // ----------------------------------------------------------------
  // UI RENDER
  // ----------------------------------------------------------------
  return (
    <Card sx={{ maxWidth: 500, margin: "auto", mt: 4, borderRadius: 3, boxShadow: 5 }}>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          {step === 3 ? "Identity Verified" : "Liveliness Check"}
        </Typography>

        {/* --- VIDEO AREA --- */}
        {step !== 3 && (
          <Box sx={{ position: "relative", width: "100%", height: 400, bgcolor: "#000", borderRadius: 2, overflow: "hidden" }}>
            {/* Show Webcam only in Step 0 (Capture) and Step 2 (Liveliness) */}
            {(step === 0 || step === 2) && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
              />
            )}

            {/* Show Frozen Image in Step 1 (Review) */}
            {step === 1 && imgSrc && <img src={imgSrc} alt="Captured" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />}

            {/* The Green Oval Overlay */}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 220,
                height: 300,
                border: step === 3 ? "4px solid #4CAF50" : "3px solid white",
                borderRadius: "50%",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Show Spinner or Success Icon inside Oval */}
              {isProcessing && step !== 2 && <CircularProgress color="secondary" size={60} />}
              {step === 3 && <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />}
            </Box>

            {/* Live Feedback Text (Replaces jQuery overlays) */}
            <Box sx={{ position: "absolute", bottom: 20, width: "100%", textAlign: "center", zIndex: 20 }}>
              <Typography variant="h6" sx={{ color: "white", textShadow: "0px 2px 4px rgba(0,0,0,0.8)" }}>
                {secondaryInfo || (step === 2 ? "Listening..." : "")}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "#eee", mt: 1 }}>
                {primaryInfo}
              </Typography>
            </Box>
          </Box>
        )}

        {/* --- CONTROLS --- */}
        <Stack spacing={2} sx={{ mt: 3 }} alignItems="center">
          {/* Step 0: Initial Capture */}
          {step === 0 && (
            <>
              <TextField label="Username" variant="outlined" size="small" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
              <Button variant="contained" size="large" startIcon={<CameraAltIcon />} onClick={capture}>
                Capture Photo
              </Button>
            </>
          )}

          {/* Step 1: Review & Submit */}
          {step === 1 && (
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" color="secondary" onClick={retake}>
                Retake
              </Button>
              <Button variant="contained" color="success" onClick={handleStartLiveliness}>
                Start Liveliness
              </Button>
            </Stack>
          )}

          {/* Step 2: Liveliness Active */}
          {step === 2 && <Alert severity="info">Follow the instructions on the screen.</Alert>}

          {/* Step 3: Success */}
          {step === 3 && <Alert severity="success">Verification Successful!</Alert>}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LivelinessChecker;
