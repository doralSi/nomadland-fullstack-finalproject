import React from 'react';
import './PointModerationCard.css';

const PointModerationCard = ({ 
  point, 
  onApprove, 
  onReject, 
  onDelete, 
  onEditLocation 
}) => {
  return (
    <div className="moderation-card">
      <div className="card-header">
        <h3>{point.title}</h3>
        <span className="status-badge pending">
          {point.status === 'pending' ? 'Pending' : point.status}
        </span>
      </div>
      
      {point.images && point.images.length > 0 && (
        <img 
          src={point.images[0]} 
          alt={point.title} 
          className="card-image" 
        />
      )}
      
      <div className="card-body">
        <p><strong>Description:</strong> {point.description || 'N/A'}</p>
        <p><strong>Category:</strong> {point.category || 'N/A'}</p>
        <p><strong>Location:</strong> {point.lat.toFixed(6)}, {point.lng.toFixed(6)}</p>
        <p><strong>Created by:</strong> {point.createdBy?.name || 'Unknown'} ({point.createdBy?.email})</p>
        <p><strong>Created:</strong> {new Date(point.createdAt).toLocaleString()}</p>
      </div>
      
      <div className="card-actions">
        <button 
          className="btn btn-approve"
          onClick={() => onApprove(point._id)}
        >
          ✓ Approve
        </button>
        <button 
          className="btn btn-reject"
          onClick={() => onReject(point._id)}
        >
          ✗ Reject
        </button>
        <button 
          className="btn btn-edit"
          onClick={() => onEditLocation(point._id)}
        >
          📍 Edit Location
        </button>
        <button 
          className="btn btn-delete"
          onClick={() => onDelete(point._id)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default PointModerationCard;
