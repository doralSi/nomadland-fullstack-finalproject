import React from 'react';
import './EventModerationCard.css';

const EventModerationCard = ({ 
  event, 
  onApprove, 
  onReject, 
  onDelete 
}) => {
  return (
    <div className="moderation-card">
      <div className="card-header">
        <h3>{event.title}</h3>
        <span className="status-badge pending">
          {event.status === 'underReview' ? 'Under Review' : event.status}
        </span>
      </div>
      
      {event.imageUrl && (
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="card-image" 
        />
      )}
      
      <div className="card-body">
        <p><strong>Description:</strong> {event.description}</p>
        <p><strong>Region:</strong> {event.region?.name || 'Unknown'}</p>
        <p><strong>Start Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> {new Date(event.endDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> {event.time}</p>
        <p><strong>Cost:</strong> {event.cost || 'Free'}</p>
        <p><strong>Repeat:</strong> {event.repeat}</p>
        {event.repeatDays && event.repeatDays.length > 0 && (
          <p><strong>Repeat Days:</strong> {event.repeatDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</p>
        )}
        <p><strong>Language:</strong> {event.language === 'he' ? 'עברית' : 'English'}</p>
        <p><strong>Location:</strong> {event.location?.lat.toFixed(6)}, {event.location?.lng.toFixed(6)}</p>
        <p><strong>Created by:</strong> {event.createdBy?.name || 'Unknown'} ({event.createdBy?.email})</p>
        <p><strong>Created:</strong> {new Date(event.createdAt).toLocaleString()}</p>
      </div>
      
      <div className="card-actions">
        <button 
          className="btn btn-approve"
          onClick={() => onApprove(event._id)}
        >
          ✓ Approve
        </button>
        <button 
          className="btn btn-reject"
          onClick={() => onReject(event._id)}
        >
          ✗ Reject
        </button>
        <button 
          className="btn btn-delete"
          onClick={() => onDelete(event._id)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default EventModerationCard;
