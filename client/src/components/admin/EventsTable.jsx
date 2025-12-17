const EventsTable = ({ 
  events, 
  onView, 
  onDelete,
  showRegion = true 
}) => {
  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            {showRegion && <th>Region</th>}
            <th>Start Date</th>
            <th>End Date</th>
            <th>Created By</th>
            <th>RSVPs</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event._id}>
              <td>{event.name}</td>
              {showRegion && <td>{event.region?.name || "N/A"}</td>}
              <td>
                {new Date(event.startDate).toLocaleDateString("en-US")}
              </td>
              <td>
                {new Date(event.endDate).toLocaleDateString("en-US")}
              </td>
              <td>{event.createdBy?.name || "Unknown"}</td>
              <td>{event.rsvps?.length || 0}</td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => onView(event)}
                    className="btn-view"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onDelete(event._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventsTable;
