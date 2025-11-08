import React, { useState, useEffect } from 'react';
import { checkIn, getAttendanceHistory } from '../../../../apis/activitiesSubscriptions';
import QRScanner from '../../shared/QRScanner/QRScanner';
import DataTable from '../../shared/DataTable/DataTable';
import './QRCheckIn.scss';

const QRCheckIn = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleQRScan = async (qrCode) => {
    setIsScanning(false);
    setLoading(true);

    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const response = await checkIn(qrCode, today);
      
      if (response.success) {
        showMessage('Check-in successful!', 'success');
        loadAttendanceHistory();
      } else {
        showMessage(response.message || 'Check-in failed', 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during check-in';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanError = (error) => {
    console.error('QR Scan Error:', error);
    showMessage('Camera access denied or QR scanner error', 'error');
  };

  const loadAttendanceHistory = async () => {
    try {
      // In a real implementation, you would get the subscription ID from context or props
      // For now, we'll show a placeholder message
      setAttendanceHistory([]);
    } catch (error) {
      console.error('Error loading attendance history:', error);
    }
  };

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  const getMessageClass = () => {
    switch (messageType) {
      case 'success':
        return 'message message--success';
      case 'error':
        return 'message message--error';
      case 'warning':
        return 'message message--warning';
      default:
        return 'message message--info';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path 
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path 
              d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID'
    },
    {
      key: 'subscription_id',
      header: 'Subscription ID'
    },
    {
      key: 'check_in_date',
      header: 'Check-in Date'
    },
    {
      key: 'day_of_week',
      header: 'Day'
    },
    {
      key: 'deducted',
      header: 'Deducted'
    }
  ];

  return (
    <div className="qr-checkin">
      <div className="page-header">
        <h1 className="page-title">QR Code Check-in</h1>
        <p className="page-subtitle">Scan QR codes to check in subscribers</p>
      </div>

      {message && (
        <div className={getMessageClass()}>
          {getStatusIcon(messageType)}
          <span>{message}</span>
        </div>
      )}

      <div className="checkin-section">
        <div className="checkin-card">
          <div className="checkin-card__header">
            <h3>Quick Check-in</h3>
            <p>Scan a subscriber's QR code to check them in</p>
          </div>
          
          <div className="checkin-card__content">
            <button 
              className="scan-btn"
              onClick={() => setIsScanning(true)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3H7V7H3V3Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M17 3H21V7H17V3Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 17H7V21H3V17Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M17 17H21V21H17V17Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 3H17V7" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 17H17V21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 7V17" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 7V17" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Scan QR Code
                </>
              )}
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-card__content">
              <h4>Today's Check-ins</h4>
              <p className="stat-number">0</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-card__content">
              <h4>Active Subscriptions</h4>
              <p className="stat-number">0</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-card__content">
              <h4>This Week</h4>
              <p className="stat-number">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="attendance-section">
        <h3 className="section-title">Recent Check-ins</h3>
        <DataTable
          data={attendanceHistory}
          columns={columns}
          loading={loading}
          emptyMessage="No check-ins recorded yet"
        />
      </div>

      <QRScanner
        isOpen={isScanning}
        onScan={handleQRScan}
        onError={handleQRScanError}
        onClose={() => setIsScanning(false)}
      />
    </div>
  );
};

export default QRCheckIn;
