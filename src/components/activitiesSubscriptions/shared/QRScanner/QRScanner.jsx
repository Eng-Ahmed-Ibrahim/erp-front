import React, { useState, useRef, useEffect } from 'react';
import './QRScanner.scss';

const QRScanner = ({ onScan, onError, onClose, isOpen }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start QR code detection
      detectQRCode();
    } catch (err) {
      setError('Camera access denied or not available');
      setIsScanning(false);
      if (onError) onError(err);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const detectQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const scanFrame = () => {
      if (!isScanning || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR code detection simulation
      // In a real implementation, you would use a QR code library like jsQR
      const qrCode = detectQRCodeInImage(imageData);
      
      if (qrCode) {
        onScan(qrCode);
        stopScanning();
        return;
      }

      requestAnimationFrame(scanFrame);
    };

    requestAnimationFrame(scanFrame);
  };

  const detectQRCodeInImage = (imageData) => {
    // This is a placeholder for QR code detection
    // In a real implementation, you would use a library like jsQR
    // For now, we'll simulate detection after a delay
    return null;
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    const qrCode = e.target.qrCode.value.trim();
    if (qrCode) {
      onScan(qrCode);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner">
        <div className="qr-scanner__header">
          <h3 className="qr-scanner__title">Scan QR Code</h3>
          <button className="qr-scanner__close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="qr-scanner__content">
          {error ? (
            <div className="qr-scanner__error">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="qr-scanner__error-icon">
                <path 
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <p className="qr-scanner__error-message">{error}</p>
              <form onSubmit={handleManualInput} className="qr-scanner__manual-form">
                <input
                  type="text"
                  name="qrCode"
                  placeholder="Enter QR code manually"
                  className="qr-scanner__manual-input"
                  required
                />
                <button type="submit" className="qr-scanner__manual-btn">
                  Submit
                </button>
              </form>
            </div>
          ) : (
            <div className="qr-scanner__camera">
              <video
                ref={videoRef}
                className="qr-scanner__video"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="qr-scanner__canvas"
                style={{ display: 'none' }}
              />
              <div className="qr-scanner__overlay">
                <div className="qr-scanner__scan-box">
                  <div className="qr-scanner__corner qr-scanner__corner--top-left"></div>
                  <div className="qr-scanner__corner qr-scanner__corner--top-right"></div>
                  <div className="qr-scanner__corner qr-scanner__corner--bottom-left"></div>
                  <div className="qr-scanner__corner qr-scanner__corner--bottom-right"></div>
                </div>
                <p className="qr-scanner__instruction">
                  Position the QR code within the frame
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
