const PointsTable = ({ 
  points, 
  onTogglePrivacy, 
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
            <th>Category</th>
            {showRegion && <th>Region</th>}
            <th>Created By</th>
            <th>Type</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point._id}>
              <td>{point.title}</td>
              <td>{point.category}</td>
              {showRegion && <td>{point.regionName || "Unknown"}</td>}
              <td>{point.createdBy?.name || "Unknown"}</td>
              <td>
                <span
                  className={`status-badge ${
                    point.isPrivate ? "pending" : "active"
                  }`}
                >
                  {point.isPrivate ? "Private" : "Public"}
                </span>
              </td>
              <td>
                {new Date(point.createdAt).toLocaleDateString("en-US")}
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => onTogglePrivacy(point._id, point.isPrivate)}
                    className={point.isPrivate ? "btn-approve" : "btn-warning"}
                  >
                    {point.isPrivate ? "Make Public" : "Make Private"}
                  </button>
                  <button
                    onClick={() => onView(point)}
                    className="btn-view"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onDelete(point._id)}
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

export default PointsTable;
