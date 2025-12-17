import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRegion } from "../context/RegionContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import PointSidePanel from "../components/PointSidePanel";
import EventDetailsModal from "../components/EventDetailsModal";
import StatsCards from "../components/admin/StatsCards";
import UsersTable from "../components/admin/UsersTable";
import PointsTable from "../components/admin/PointsTable";
import EventsTable from "../components/admin/EventsTable";
import Pagination from "../components/admin/Pagination";
import PromoteModal from "../components/admin/PromoteModal";
import { CATEGORIES } from "../constants/categories";
import {
  getAdminStats,
  getUsers,
  freezeUser,
  unfreezeUser,
  deleteUser,
  promoteToMapRanger,
  demoteFromMapRanger,
  getAdminPoints,
  deletePoint,
  getAdminEvents,
  deleteEvent,
} from "../api/admin";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { regions } = useRegion();
  const navigate = useNavigate();
  
  // Stats
  const [stats, setStats] = useState(null);
  
  // Active tab
  const [activeTab, setActiveTab] = useState("users");
  
  // Users tab
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("");
  const [usersStatusFilter, setUsersStatusFilter] = useState("");
  
  // Points tab
  const [points, setPoints] = useState([]);
  const [pointsPage, setPointsPage] = useState(1);
  const [pointsTotalPages, setPointsTotalPages] = useState(1);
  const [pointsSearch, setPointsSearch] = useState("");
  const [pointsRegionFilter, setPointsRegionFilter] = useState("");
  const [pointsCategoryFilter, setPointsCategoryFilter] = useState("");
  const [pointsStatusFilter, setPointsStatusFilter] = useState("");
  const [selectedPointForView, setSelectedPointForView] = useState(null);
  
  // Events tab
  const [events, setEvents] = useState([]);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  const [eventsSearch, setEventsSearch] = useState("");
  const [eventsRegionFilter, setEventsRegionFilter] = useState("");
  const [eventsStartDate, setEventsStartDate] = useState("");
  const [eventsEndDate, setEventsEndDate] = useState("");
  const [selectedEventForView, setSelectedEventForView] = useState(null);
  
  const [loading, setLoading] = useState(false);
  
  // Promote modal
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [userToPromote, setUserToPromote] = useState(null);
  const [selectedRegions, setSelectedRegions] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Load stats
  useEffect(() => {
    loadStats();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    } else if (activeTab === "points") {
      loadPoints();
    } else if (activeTab === "events") {
      loadEvents();
    }
  }, [
    activeTab,
    usersPage,
    usersSearch,
    usersRoleFilter,
    usersStatusFilter,
    pointsPage,
    pointsSearch,
    pointsRegionFilter,
    pointsCategoryFilter,
    pointsStatusFilter,
    eventsPage,
    eventsSearch,
    eventsRegionFilter,
    eventsStartDate,
    eventsEndDate,
  ]);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers({
        page: usersPage,
        search: usersSearch,
        role: usersRoleFilter,
        status: usersStatusFilter,
      });
      setUsers(data.users);
      setUsersTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPoints = async () => {
    setLoading(true);
    try {
      const data = await getAdminPoints({
        page: pointsPage,
        search: pointsSearch,
        region: pointsRegionFilter,
        category: pointsCategoryFilter,
        status: pointsStatusFilter,
      });
      setPoints(data.points);
      setPointsTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error loading points:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getAdminEvents({
        page: eventsPage,
        search: eventsSearch,
        region: eventsRegionFilter,
        startDate: eventsStartDate,
        endDate: eventsEndDate,
      });
      setEvents(data.events);
      setEventsTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeUser = async (userId) => {
    if (window.confirm("האם אתה בטוח שברצונך להקפיא את המשתמש?")) {
      try {
        await freezeUser(userId);
        loadUsers();
        loadStats();
      } catch (error) {
        console.error("Error freezing user:", error);
        alert("Error freezing user");
      }
    }
  };

  const handleUnfreezeUser = async (userId) => {
    try {
      await unfreezeUser(userId);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error("Error unfreezing user:", error);
      alert("Error unfreezing user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone!")) {
      try {
        await deleteUser(userId);
        loadUsers();
        loadStats();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.response?.data?.message || "Error deleting user");
      }
    }
  };

  const handlePromoteUser = async (userId) => {
    setUserToPromote(userId);
    setSelectedRegions([]);
    setShowPromoteModal(true);
  };
  
  const confirmPromote = async () => {
    if (selectedRegions.length === 0) {
      alert("Please select at least one region");
      return;
    }
    
    try {
      await promoteToMapRanger(userToPromote, selectedRegions);
      setShowPromoteModal(false);
      setUserToPromote(null);
      setSelectedRegions([]);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error("Error promoting user:", error);
      alert("Error promoting user");
    }
  };

  const handleDemoteUser = async (userId) => {
    if (window.confirm("Are you sure you want to demote this user from Map Ranger?")) {
      try {
        await demoteFromMapRanger(userId);
        loadUsers();
        loadStats();
      } catch (error) {
        console.error("Error demoting user:", error);
        alert("Error demoting user");
      }
    }
  };

  const handleTogglePrivacy = async (pointId, currentIsPrivate) => {
    const newPrivacy = !currentIsPrivate;
    const message = newPrivacy 
      ? "Are you sure you want to make this point private?"
      : "Are you sure you want to make this point public?";
    
    if (window.confirm(message)) {
      try {
        await axiosInstance.patch(`/admin/points/${pointId}/privacy`, { isPrivate: newPrivacy });
        loadPoints();
        loadStats();
      } catch (error) {
        console.error("Error toggling point privacy:", error);
        alert("Error updating point privacy");
      }
    }
  };

  const handleDeletePoint = async (pointId) => {
    if (window.confirm("Are you sure you want to delete this point? This action cannot be undone!")) {
      try {
        await deletePoint(pointId);
        loadPoints();
        loadStats();
      } catch (error) {
        console.error("Error deleting point:", error);
        alert("Error deleting point");
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone!")) {
      try {
        await deleteEvent(eventId);
        loadEvents();
        loadStats();
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Error deleting event");
      }
    }
  };

  const handleUsersSearchChange = (e) => {
    setUsersSearch(e.target.value);
    setUsersPage(1);
  };

  const handlePointsSearchChange = (e) => {
    setPointsSearch(e.target.value);
    setPointsPage(1);
  };

  const handleEventsSearchChange = (e) => {
    setEventsSearch(e.target.value);
    setEventsPage(1);
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`tab-button ${activeTab === "points" ? "active" : ""}`}
          onClick={() => setActiveTab("points")}
        >
          Points
        </button>
        <button
          className={`tab-button ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Events
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="tab-content">
          <div className="filters-bar">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={usersSearch}
              onChange={handleUsersSearchChange}
              className="search-input"
            />
            <select
              value={usersRoleFilter}
              onChange={(e) => {
                setUsersRoleFilter(e.target.value);
                setUsersPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="mapRanger">Map Ranger</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={usersStatusFilter}
              onChange={(e) => {
                setUsersStatusFilter(e.target.value);
                setUsersPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="frozen">Frozen</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <UsersTable
                users={users}
                onFreeze={handleFreezeUser}
                onUnfreeze={handleUnfreezeUser}
                onPromote={handlePromoteUser}
                onDemote={handleDemoteUser}
                onDelete={handleDeleteUser}
              />

              <Pagination
                currentPage={usersPage}
                totalPages={usersTotalPages}
                onPageChange={setUsersPage}
              />
            </>
          )}
        </div>
      )}

      {/* Points Tab */}
      {activeTab === "points" && (
        <div className="tab-content">
          <div className="filters-bar">
            <input
              type="text"
              placeholder="Search by point name..."
              value={pointsSearch}
              onChange={handlePointsSearchChange}
              className="search-input"
            />
            <select
              value={pointsRegionFilter}
              onChange={(e) => {
                setPointsRegionFilter(e.target.value);
                setPointsPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region._id} value={region.slug}>
                  {region.name}
                </option>
              ))}
            </select>
            <select
              value={pointsCategoryFilter}
              onChange={(e) => {
                setPointsCategoryFilter(e.target.value);
                setPointsPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              value={pointsStatusFilter}
              onChange={(e) => {
                setPointsStatusFilter(e.target.value);
                setPointsPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <PointsTable
                points={points}
                onTogglePrivacy={handleTogglePrivacy}
                onView={setSelectedPointForView}
                onDelete={handleDeletePoint}
                showRegion={true}
              />

              <Pagination
                currentPage={pointsPage}
                totalPages={pointsTotalPages}
                onPageChange={setPointsPage}
              />
            </>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="tab-content">
          <div className="filters-bar">
            <input
              type="text"
              placeholder="Search by event name..."
              value={eventsSearch}
              onChange={handleEventsSearchChange}
              className="search-input"
            />
            <select
              value={eventsRegionFilter}
              onChange={(e) => {
                setEventsRegionFilter(e.target.value);
                setEventsPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region._id} value={region._id}>
                  {region.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={eventsStartDate}
              onChange={(e) => {
                setEventsStartDate(e.target.value);
                setEventsPage(1);
              }}
              className="filter-select"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={eventsEndDate}
              onChange={(e) => {
                setEventsEndDate(e.target.value);
                setEventsPage(1);
              }}
              className="filter-select"
              placeholder="End Date"
            />
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <EventsTable
                events={events}
                onView={setSelectedEventForView}
                onDelete={handleDeleteEvent}
                showRegion={true}
              />

              <Pagination
                currentPage={eventsPage}
                totalPages={eventsTotalPages}
                onPageChange={setEventsPage}
              />
            </>
          )}
        </div>
      )}
      
      {/* Promote to Map Ranger Modal */}
      {showPromoteModal && (
        <PromoteModal
          regions={regions}
          selectedRegions={selectedRegions}
          onToggleRegion={(slug, checked) => {
            if (checked) {
              setSelectedRegions([...selectedRegions, slug]);
            } else {
              setSelectedRegions(selectedRegions.filter(s => s !== slug));
            }
          }}
          onConfirm={confirmPromote}
          onCancel={() => setShowPromoteModal(false)}
        />
      )}

      {/* Point View Modal */}
      {selectedPointForView && (
        <div className="modal-overlay" onClick={() => setSelectedPointForView(null)}>
          <div className="point-modal-container" onClick={(e) => e.stopPropagation()}>
            <PointSidePanel
              point={selectedPointForView}
              onClose={() => setSelectedPointForView(null)}
              onToggleFavorite={() => {}}
              isFavorite={false}
            />
          </div>
        </div>
      )}

      {/* Event View Modal */}
      {selectedEventForView && (
        <EventDetailsModal
          event={selectedEventForView}
          region={selectedEventForView.region}
          onClose={() => setSelectedEventForView(null)}
          onShowOnMap={() => {}}
          onEventDeleted={() => {
            setSelectedEventForView(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
