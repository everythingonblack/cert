import React, { useState, useRef, useEffect } from 'react';

const CameraPage = ({ handleClose, handleUploadImage }) => {
  const [image, setImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Start the camera when the component mounts
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    startCamera();

    // Cleanup camera stream when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Capture the image from the video stream
  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const capturedImage = canvas.toDataURL('image/jpeg');
      setImage(capturedImage);
      setIsCameraActive(false);
    }
  };

  // Handle image upload from file input
  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setIsCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cancel the image capture or file upload and restart the camera
  const cancelCapture = () => {
    setImage(null);
    setIsCameraActive(true);
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    startCamera();
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const mainContent = (
    <div style={containerStyle}>
      {/* Camera/Image Display Area */}
      <div style={cameraContainerStyle}>
        {isCameraActive && (
          <video ref={videoRef} autoPlay playsInline style={videoStyle} />
        )}

        {!isCameraActive && image && (
          <img src={image} alt="Captured or Uploaded" style={imageStyle} />
        )}

        {/* Floating Controls */}
        <div style={controlsStyle}>
          {isCameraActive ? (
            <>
              <button
                onClick={handleClose}
                style={cancelButtonStyle}
                aria-label="Cancel and retake"
              >
                ❌
              </button>
              <button
                onClick={captureImage}
                style={captureButtonStyle}
                aria-label="Capture photo"
              >
                📸
              </button>
              <button
                onClick={triggerFileInput}
                style={uploadButtonStyle}
                aria-label="Upload from gallery"
              >
                📁
              </button>
            </>
          ) : (
            <>
              <button
                onClick={cancelCapture}
                style={cancelButtonStyle}
                aria-label="Cancel and retake"
              >
                ❌
              </button>
              <button
                onClick={() => handleUploadImage(image)} // Pass image data here
                style={confirmButtonStyle}
                disabled={uploading}
                aria-label={uploading ? 'Uploading...' : 'Confirm upload'}
              >
                {uploading ? '⏳' : '✅'}
              </button>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>

      {/* Hidden canvas element for capturing the image */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );

  // Desktop layout with left and right sidebars
  if (!isMobile) {
    return (
      <div style={desktopLayoutStyle}>
        {/* Left Sidebar */}
        <div style={sidebarStyle}></div>

        {/* Main content */}
        <div style={mainContentStyle}>{mainContent}</div>

        {/* Right Sidebar */}
        <div style={sidebarStyle}></div>
      </div>
    );
  }

  // Mobile layout (full screen)
  return mainContent;
};

// Styles
const containerStyle = {
  position: 'absolute',
  width: '100%',
  height: '100vh',
  backgroundColor: '#000',
  overflow: 'hidden',
};

const cameraContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const videoStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const controlsStyle = {
  position: 'absolute',
  bottom: '30px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '20px',
  alignItems: 'center',
};

const baseButtonStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.2s ease',
};

const captureButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#fff',
  color: '#000',
};

const uploadButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#4CAF50',
  color: '#fff',
};

const cancelButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#f44336',
  color: '#fff',
};

const confirmButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#4CAF50',
  color: '#fff',
};

// Desktop styles
const desktopLayoutStyle = {
  display: 'flex',
  height: '100vh',
  fontFamily: 'Arial, sans-serif',
};

const sidebarStyle = {
  width: '250px',
  backgroundColor: '#fff',
  color: '#333',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  borderRight: '1px solid #e0e0e0',
};

const sidebarTitleStyle = {
  margin: '0 0 30px 0',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
};

const sidebarContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const sidebarTextStyle = {
  margin: '0',
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#666',
};

const mainContentStyle = {
  flex: 1,
  position: 'relative',
};

export default CameraPage;
