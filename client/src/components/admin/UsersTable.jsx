const UsersTable = ({ 
  users, 
  onFreeze, 
  onUnfreeze, 
  onPromote, 
  onDemote, 
  onDelete 
}) => {
  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Points</th>
            <th>Reviews</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span className={`role-badge ${u.role}`}>
                  {u.role === "admin"
                    ? "Admin"
                    : u.role === "mapRanger"
                    ? "Map Ranger"
                    : "User"}
                </span>
              </td>
              <td>
                <span
                  className={`status-badge ${
                    u.status === "frozen" ? "frozen" : "active"
                  }`}
                >
                  {u.status === "frozen" ? "Frozen" : "Active"}
                </span>
              </td>
              <td>{u.pointsCount}</td>
              <td>{u.reviewsCount}</td>
              <td>
                <div className="action-buttons">
                  {u.status === "active" ? (
                    <button
                      onClick={() => onFreeze(u._id)}
                      className="btn-freeze"
                      disabled={u.role === "admin"}
                    >
                      Freeze
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnfreeze(u._id)}
                      className="btn-unfreeze"
                    >
                      Unfreeze
                    </button>
                  )}
                  {u.role !== "admin" && (
                    <button
                      onClick={() => u.role === "user" ? onPromote(u._id) : onDemote(u._id)}
                      className={u.role === "user" ? "btn-promote" : "btn-demote"}
                    >
                      {u.role === "user" ? "Ranger" : "User"}
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(u._id)}
                    className="btn-delete"
                    disabled={u.role === "admin"}
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

export default UsersTable;
