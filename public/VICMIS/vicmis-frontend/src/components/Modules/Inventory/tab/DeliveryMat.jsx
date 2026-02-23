import React, { useState, useEffect } from 'react';
import api from '@/api/axios'; 
import '../css/Construction.css';

const DeliveryMat = ({ onBack }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',         
    recipient: '',    
    destination: '',
    quantity: '',
    driver: '',
    expected_delivery: '' 
  });

  const fetchDeliveries = async () => {
    try {
      setLoading(true); 
      const res = await api.get('/inventory/logistics');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setDeliveries(data);
    } catch (err) {
      console.error("Error fetching logistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  // --- NEW FUNCTION: MARK AS DELIVERED ---
  const handleDelivered = async (id) => {
    if (!window.confirm("Mark this item as delivered?")) return;
    try {
      await api.patch(`/inventory/logistics/${id}/delivered`);
      await fetchDeliveries(); // Refresh the table
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      recipient: formData.recipient, 
      destination: formData.destination,
      quantity: Number(formData.quantity),
      driver: formData.driver,
      expected_delivery: formData.expected_delivery
    };

    try {
      await api.post('/inventory/stock-out', payload);
      setFormData({ name: '', recipient: '', destination: '', quantity: '', driver: '', expected_delivery: '' });
      setShowModal(false);
      await fetchDeliveries(); 
      alert("Delivery scheduled successfully!");
    } catch (err) {
      alert(`Dispatch Failed: ${err.response?.data?.message || "Error"}`);
    }
  };

  return (
    <div className="construction-container">
      <div className="table-header-box">
        <div className="left-side">
          <button className="back-nav-btn" onClick={onBack}>← Back</button>
          <h2>Delivery Logistics</h2>
        </div>
        <button className="add-material-btn" onClick={() => setShowModal(true)}>
          + Schedule Delivery
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule New Delivery</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSchedule}>
              <div className="modal-form-grid">
                <div className="form-group-dispatch">
                  <label>Material Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group-dispatch">
                  <label>Quantity</label>
                  <input type="number" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className="form-group-dispatch">
                  <label>Recipient Name</label>
                  <input type="text" required value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} />
                </div>
                <div className="form-group-dispatch">
                  <label>Destination Address</label>
                  <input type="text" required value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} />
                </div>
                <div className="form-group-dispatch">
                  <label>Driver Name</label>
                  <input type="text" required value={formData.driver} onChange={(e) => setFormData({...formData, driver: e.target.value})} />
                </div>
                <div className="form-group-dispatch">
                  <label>Expected Delivery Date</label>
                  <input type="date" required value={formData.expected_delivery} onChange={(e) => setFormData({...formData, expected_delivery: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="confirm-dispatch-btn">Confirm Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="construction-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Qty</th>
              <th>Recipient</th>
              <th>Destination</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Expected Date</th>
              <th>Departure</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="loading-text">Updating feed...</td></tr>
            ) : deliveries.length > 0 ? (
              deliveries.map(d => (
                <tr key={d.id}>
                  <td className="font-bold">{d.item_name}</td> 
                  <td>{d.quantity}</td>
                  <td>{d.recipient}</td>
                  <td>{d.destination}</td>
                  <td>{d.driver_name}</td>
                  <td>
                    <span className={`status-pill ${d.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>{d.expected_delivery_date || '---'}</td>
                  <td className="time-text">{d.departure_time}</td>
                  <td>
                    {/* ONLY SHOW BUTTON IF NOT DELIVERED */}
                    {d.status !== 'Delivered' ? (
                      <button 
                        className="delivered-action-btn" 
                        onClick={() => handleDelivered(d.id)}
                      >
                        Mark Delivered
                      </button>
                    ) : (
                      <span className="done-check">Delivered</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" className="empty-state">No active deliveries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryMat;