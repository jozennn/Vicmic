import React, { useState, useEffect } from 'react';
import api from '@/api/axios'; 
import inventoryService from '@/api/inventoryService'; 
import '../css/Construction.css';

const ConstructionMat = ({ onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '', 
    description: '', 
    quantity: '', 
    unit: '', 
    unit_price: '', 
    supplier: 'Initial Stock'
  });

  // Fetch warehouse materials
  const fetchMaterials = async () => {
    try {
        // Use getConstruction() instead of getShipments()
        const res = await inventoryService.getConstruction();
        setMaterials(res.data);
    } catch (err) {
        console.error("Error loading inventory:", err);
    } finally {
        setLoading(false);
    }
};


  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleEditClick = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '', // Ensure we grab the existing description
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      supplier: item.supplier || 'Warehouse Update'
    });
    setIsModalOpen(true);
  };

 const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
        try {
            // This will now work because inventoryService is defined
            await inventoryService.deleteMaterial(id);
            alert("Deleted successfully!");
            fetchMaterials(); // Refresh your table
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Delete failed. Check the Network tab for details.");
        }
    }
};

const handleSave = async (e) => {
    e.preventDefault();
    try {
        if (isEditing) {
            // This sends the description you typed in image_a20340.png
            await inventoryService.updateMaterial(currentId, formData);
            alert("Updated successfully!");
        } else {
            await inventoryService.stockIn(formData);
            alert("New material added!");
        }
        closeModal();
        fetchMaterials();
    } catch (err) {
        // Better error message handling
        const msg = err.response?.data?.message || "Check connection";
        alert("Failed to save: " + msg);
    }
};

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', description: '', quantity: '', unit: '', unit_price: '', supplier: 'Initial Stock' });
  };

  const filteredMaterials = materials.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="construction-container">
      <div className="table-header-box">
        <div className="left-side">
          <button className="back-nav-btn" onClick={onBack}>← Back</button>
          <h2>Construction Materials (Warehouse)</h2>
        </div>
        
        <div className="action-area">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search warehouse..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-material-btn" onClick={() => setIsModalOpen(true)}>
            + Add Material
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="construction-table">
          <thead>
            <tr>
              <th>Material Name</th>
              <th style={{ width: '35%' }}>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Price</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center">Loading Warehouse Data...</td></tr>
            ) : filteredMaterials.length > 0 ? (
              filteredMaterials.map((item) => (
                <tr key={item.id}>
                  <td className="font-bold">{item.name}</td>
                  <td className="desc-text">
                    {/* Explicitly rendering description here */}
                    {item.description || <span className="no-desc">No description</span>}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>₱{item.unit_price}</td>
                  <td className="action-btns">
                    <button className="edit-action" onClick={() => handleEditClick(item)}>Edit</button>
                    <button className="delete-action" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="no-results">No materials found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Material' : 'Add New Material'}</h2>
              <button className="close-x" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="material-form">
              <div className="form-group">
                <label>Material Name</label>
                <input type="text" required value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  rows="3"
                  placeholder="Enter material details..."
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" required value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input type="text" placeholder="pcs, rolls" required value={formData.unit} 
                    onChange={(e) => setFormData({...formData, unit: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Unit Price (₱)</label>
                <input type="number" step="0.01" required value={formData.unit_price} 
                  onChange={(e) => setFormData({...formData, unit_price: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-save-material">
                  {isEditing ? 'Update Material' : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionMat;