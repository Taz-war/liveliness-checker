import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Box, Button, Typography, Card, CardContent, Stack, CircularProgress, Alert } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Configuration for the webcam (force front camera)
const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: "user",
};

const LivelinessChecker = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Capture the image
  const capture = useCallback(() => {
    setIsScanning(true);

    // Simulate a "scanning" delay for realism (1.5 seconds)
    setTimeout(() => {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      setIsScanning(false);
    }, 1500);
  }, [webcamRef]);

  const handleSubmit = async () => {
    console.log({ imgSrc });
    const response = await fetch("/verify-liveliness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imgSrc }),
    });
    // Handle Flask response...
  };

  // Reset to retake
  const retake = () => {
    setImgSrc(null);
  };

  return (
    <Card sx={{ maxWidth: 500, margin: "auto", mt: 4, borderRadius: 3, boxShadow: 5 }}>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          Liveliness Check
        </Typography>

        {!imgSrc ? (
          <Box sx={{ position: "relative", width: "100%", height: 400, bgcolor: "#000", borderRadius: 2, overflow: "hidden" }}>
            {/* 1. The Webcam Feed */}
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // Ensures the video fills the box
              }}
            />

            {/* 2. The Face Guide Overlay (The Oval) */}
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 220,
                height: 300,
                border: "3px solid white", // Guide border
                borderRadius: "50%", // Makes it an oval
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)", // Dims the outside area
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isScanning && <CircularProgress color="secondary" size={60} />}
            </Box>

            {/* 3. Instructions */}
            <Typography
              variant="subtitle1"
              sx={{
                position: "absolute",
                bottom: 20,
                width: "100%",
                textAlign: "center",
                color: "white",
                zIndex: 20,
                textShadow: "0px 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              {isScanning ? "Verifying..." : "Position your face in the oval"}
            </Typography>
          </Box>
        ) : (
          /* 4. Result View */
          <Box sx={{ textAlign: "center", py: 3 }}>
            <img src={imgSrc} alt="Captured" style={{ width: "200px", borderRadius: "10px", marginBottom: "20px" }} />
            <Alert severity="success" sx={{ mb: 2 }}>
              Face Captured Successfully
            </Alert>
          </Box>
        )}

        {/* 5. Control Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          {!imgSrc ? (
            <Button variant="contained" color="primary" size="large" startIcon={<CameraAltIcon />} onClick={capture} disabled={isScanning}>
              Verify Identity
            </Button>
          ) : (
            <>
              <Button variant="outlined" color="secondary" startIcon={<RefreshIcon />} onClick={retake}>
                Retake
              </Button>
              <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleSubmit()}>
                Submit
              </Button>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LivelinessChecker;
