import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import './Header.css';

const Header = ({ user }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(null);

  // Consolidated state for all request types
  const [requestData, setRequestData] = useState({ 
    type: 'Leave', 
    startDate: '', 
    endDate: '', 
    date: '',      // For OT Work Date
    startTime: '', // OT Start
    endTime: '',   // OT End
    reason: '' 
  });

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Announcements
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await api.get('/hr/latest-announcement');
        if (res.data && res.data.message) {
          setAnnouncement(res.data);
        } else {
          setAnnouncement(null);
        }
      } catch (err) {
        setAnnouncement(null);
        console.error("Broadcast failed to load.");
      }
    };
    fetchAnnouncement();
    const interval = setInterval(fetchAnnouncement, 10000);
    return () => clearInterval(interval);
  }, []);

  // Validation Logic
  const validateForm = () => {
    if (requestData.type === 'Leave' || requestData.type === 'Absent') {
      if (!requestData.startDate || !requestData.endDate) return "Please select both dates.";
      if (new Date(requestData.startDate) > new Date(requestData.endDate)) {
        return "End Date cannot be earlier than Start Date.";
      }
    }

    if (requestData.type === 'OT') {
      if (!requestData.date || !requestData.startTime || !requestData.endTime) {
        return "Please fill in the date and time for OT.";
      }
      const start = new Date(`2000-01-01T${requestData.startTime}`);
      const end = new Date(`2000-01-01T${requestData.endTime}`);
      if (start >= end) return "OT End Time must be after the Start Time.";
    }

    if (requestData.reason.trim().length < 5) return "Reason is too short.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      // Formatting payload based on type
      const payload = {
        type: requestData.type,
        reason: requestData.reason,
        status: 'pending'
      };

      if (requestData.type === 'OT') {
        payload.date = requestData.date;
        payload.start_time = requestData.startTime;
        payload.end_time = requestData.endTime;
      } else {
        payload.start_date = requestData.startDate;
        payload.end_date = requestData.endDate;
      }

      await api.post('/hr/employee-requests', payload);
      alert("Request submitted successfully!");
      setIsModalOpen(false);
      
      // Reset State
      setRequestData({ 
        type: 'Leave', startDate: '', endDate: '', 
        date: '', startTime: '', endTime: '', reason: '' 
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit request.");
    }
  };

  return (
    <div className="header-wrapper">
      <header className="main-header">
        <div className="header-left">
          <div className="brand">
            <span className="logo-dot"></span>
            <h2>VISION<span>OFC</span></h2>
          </div>
          <div className="user-info">
            <h1 className="welcome-msg">Hello, {user?.name || 'Grace HR Head'}</h1>
            <p className="live-date">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              <span className="live-time"> {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>
        </div>

        <div className="header-center">
          {announcement && (
            <div className={`announcement-capsule ${announcement.type || 'notice'}`}>
              <span className="capsule-icon">📢</span>
              <div className="marquee-container">
                <p className="marquee-text">
                  <span className="announcement-date-badge">{announcement.date}</span>
                  <span className="capsule-label">{announcement.type}:</span> {announcement.message}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="header-right">
          <button className="request-btn" onClick={() => setIsModalOpen(true)}>
            <span className="plus-icon">+</span> Submit Request
          </button>
          <div className="user-avatar">{user?.name?.charAt(0) || 'G'}</div>
        </div>
      </header>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>New Employee Request</h3>
              <p style={{ fontSize: '12px', color: '#497B97' }}>Complete the details for HR review</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Request Type</label>
                <select 
                  value={requestData.type} 
                  onChange={(e) => setRequestData({...requestData, type: e.target.value})}
                >
                  <option value="Leave">Leave</option>
                  <option value="Absent">Absent</option>
                  <option value="OT">Overtime (OT)</option>
                </select>
              </div>

              {/* DYNAMIC FIELD RENDERING */}
              {(requestData.type === 'Leave' || requestData.type === 'Absent') ? (
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input 
                      type="date" required
                      value={requestData.startDate}
                      onChange={(e) => setRequestData({...requestData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input 
                      type="date" required
                      value={requestData.endDate}
                      onChange={(e) => setRequestData({...requestData, endDate: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Work Date</label>
                    <input 
                      type="date" required
                      value={requestData.date}
                      onChange={(e) => setRequestData({...requestData, date: e.target.value})}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time</label>
                      <input 
                        type="time" required
                        value={requestData.startTime}
                        onChange={(e) => setRequestData({...requestData, startTime: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input 
                        type="time" required
                        value={requestData.endTime}
                        onChange={(e) => setRequestData({...requestData, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Reason / Remarks</label>
                <textarea 
                  required rows="3" 
                  placeholder="State your reason..."
                  value={requestData.reason} 
                  onChange={(e) => setRequestData({...requestData, reason: e.target.value})} 
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;