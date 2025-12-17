const StatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-info">
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
          <small>{stats.newUsers} new (7 days)</small>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-info">
          <h3>{stats.totalPoints}</h3>
          <p>Total Points</p>
          <small>{stats.pendingPoints} pending</small>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-info">
          <h3>{stats.totalEvents}</h3>
          <p>Total Events</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-info">
          <h3>{stats.totalReviews}</h3>
          <p>Total Reviews</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-info">
          <h3>{stats.mapRangers}</h3>
          <p>Map Rangers</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-info">
          <h3>{stats.admins}</h3>
          <p>Admins</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
