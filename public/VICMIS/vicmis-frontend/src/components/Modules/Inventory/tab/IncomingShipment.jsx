import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import inventoryService from '@/api/inventoryService'; 
import '../css/Construction.css';

const IncomingShipment = ({ onBack }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    supplier: '',
    quantity: '',
    unit_price: '',
    unit: 'pcs'
  });

  const fetchShipments = async () => {
    try {
      const res = await api.get('/inventory/shipments');
      setShipments(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShipments(); }, []);

  const handleAddShipment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/stock-in', formData);
      alert("Shipment Scheduled!");
      setIsFormOpen(false);
      setFormData({ name: '', description: '', supplier: '', quantity: '', unit_price: '', unit: 'pcs' });
      fetchShipments();
    } catch (err) { alert("Error: " + err.response?.data?.message); }
  };

  const handleReceive = async (id) => {
    try {
      await api.patch(`/inventory/shipments/${id}/receive`);
      alert("Stock Received!");
      fetchShipments();
    } catch (err) { alert("Update failed."); }
  };

  return (
    <div className="construction-container">
      <div className="table-header-box">
        <div className="left-side">
          <button className="back-nav-btn" onClick={onBack}>← Back</button>
          <h2>Incoming Shipments</h2>
        </div>
        <button className="add-material-btn" onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? 'Cancel' : '+ New Shipment'}
        </button>
      </div>

      {isFormOpen && (
        <div className="stock-in-form-container">
          <form onSubmit={handleAddShipment} className="stock-in-grid">
            <div className="form-group-stockin">
              <label>Material Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group-stockin">
              <label>Supplier</label>
              <input type="text" required value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} />
            </div>
            <div className="form-group-stockin">
              <label>Quantity</label>
              <input type="number" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
            </div>
            <div className="form-group-stockin">
              <label>Unit Price</label>
              <input type="number" step="0.01" required value={formData.unit_price} onChange={(e) => setFormData({...formData, unit_price: e.target.value})} />
            </div>
            <div className="form-group-stockin full-width">
              <label>Description / Notes</label>
              <textarea rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="e.g., Fragile, Batch #101..." />
            </div>
            <button type="submit" className="submit-stockin-btn">Schedule Shipment</button>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <table className="construction-table">
          <thead>
            <tr>
              <th>Item Name</th><th>Supplier</th><th>Qty</th><th>Price</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && shipments.map(s => (
              <tr key={s.id}>
                <td>
                    <div className="font-bold">{s.name}</div>
                    <div className="desc-subtext">{s.description}</div>
                </td>
                <td>{s.supplier}</td>
                <td>{s.quantity} {s.unit}</td>
                <td>₱{s.unit_price}</td>
                <td><span className={`status-pill ${s.status === 'Received' ? 'received' : 'on-the-way'}`}>{s.status}</span></td>
                <td>
                  {s.status !== 'Received' && (
                    <button className="receive-action-btn" onClick={() => handleReceive(s.id)}>Receive</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomingShipment;