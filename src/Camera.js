import React, { useState, useRef, useEffect } from 'react';

const CameraPage = ({ handleClose, handleUploadImage }) => {
  const [image, setImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isUploadedFile, setIsUploadedFile] = useState(false); // ✅ NEW STATE
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

useEffect(() => {
  let stream;

  const startCamera = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
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

  // Clean-up logic (seperti socket.off)
  return () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };
}, []);


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
      setIsUploadedFile(false); // ✅ from camera
    }
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setIsCameraActive(false);
        setIsUploadedFile(true); // ✅ from file
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelCapture = () => {
    setImage(null);
    setIsCameraActive(true);
    setIsUploadedFile(false); // ✅ reset

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const mainContent = (
    <div style={containerStyle}>
      <div style={cameraContainerStyle}>
        {isCameraActive && (
          <video ref={videoRef} autoPlay playsInline style={videoStyle} />
        )}

        {!isCameraActive && image && (
          <img
            src={image}
            alt="Captured or Uploaded"
            style={{
              ...imageStyle,
              objectFit: isUploadedFile ? 'contain' : 'cover',
              backgroundColor: '#000',
            }}
          />
        )}

        <div style={controlsStyle}>
          {isCameraActive ? (
            <>
              <button
                onClick={() => {
                  handleClose();
                }}
                style={baseButtonStyle}
                aria-label="Cancel and retake"
              >
                <img
                  src="/back.png"
                  alt="Kamera"
                  style={{ height: '26px' }}
                />  
              </button>
              <button
                onClick={captureImage}
                style={baseButtonStyle}
                aria-label="Capture photo"
              >
                <img
                  src="/camera.png"
                  alt="Kamera"
                  style={{ height: '24px' }}
                />
              </button>
              <button
                onClick={triggerFileInput}
                style={baseButtonStyle}
                aria-label="Upload from gallery"
              >
                <img
                  src="/upload.png"
                  alt="Kamera"
                  style={{ height: '24px' }}
                />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={cancelCapture}
                style={baseButtonStyle}
                aria-label="Cancel and retake"
              >
                <img
                  src="/back.png"
                  alt="Kamera"
                  style={{ height: '26px' }}
                />  
              </button>
              <button
                onClick={() => handleUploadImage(image)}
                style={baseButtonStyle}
                disabled={uploading}
                aria-label={uploading ? 'Uploading...' : 'Confirm upload'}
              >
                <img
                  src="/send.png"
                  alt="Kamera"
                  style={{ height: '24px' }}
                />              </button>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );

  if (!isMobile) {
    return (
      <div style={desktopLayoutStyle}>
        <div style={sidebarStyle}></div>
        <div style={mainContentStyle}>{mainContent}</div>
        <div style={sidebarStyle}></div>
      </div>
    );
  }

  return mainContent;
};

// Styles
const containerStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
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
};

const controlsStyle = {
  position: 'fixed',
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


const confirmButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#4CAF50',
  color: '#fff',
};

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

const mainContentStyle = {
  flex: 1,
  position: 'relative',
};

export default CameraPage;
