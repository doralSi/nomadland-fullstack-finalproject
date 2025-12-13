import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import MapRangerRoute from './components/MapRangerRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePoint from './pages/CreatePoint';
import PointList from './pages/PointList';
import PointDetails from './pages/PointDetails';
import GlobalMap from './pages/GlobalMap';
import RegionPage from './pages/RegionPage';
import EventsBoard from './pages/EventsBoard';
import EventDetails from './pages/EventDetails';
import AddEvent from './pages/AddEvent';
import EditEvent from './pages/EditEvent';
import MyEvents from './pages/MyEvents';
import MyMaps from './pages/MyMaps';
import PersonalRegionMap from './pages/PersonalRegionMap';
import CreateMap from './pages/CreateMap';
import EditMap from './pages/EditMap';
import ViewMap from './pages/ViewMap';
import MapRangerPanel from './pages/MapRangerPanel';
import EditPointLocation from './pages/EditPointLocation';
import ManageUsers from './pages/ManageUsers';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<GlobalMap />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/region/:slug" element={<RegionPage />} />
          <Route path="/region/:slug/events" element={<EventsBoard />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/points" element={<PointList />} />
          <Route path="/points/:id" element={<PointDetails />} />
          <Route
            path="/create-point"
            element={
              <ProtectedRoute>
                <CreatePoint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/region/:slug/events/add"
            element={
              <ProtectedRoute>
                <AddEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event/:id/edit"
            element={
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me/events"
            element={
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me/maps"
            element={
              <ProtectedRoute>
                <MyMaps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me/maps/:regionSlug"
            element={
              <ProtectedRoute>
                <PersonalRegionMap />
              </ProtectedRoute>
            }
          />
          <Route path="/personal-maps" element={<ProtectedRoute><MyMaps /></ProtectedRoute>} />
          <Route
            path="/me/maps/create"
            element={
              <ProtectedRoute>
                <CreateMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me/maps/:id/edit"
            element={
              <ProtectedRoute>
                <EditMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me/maps/:id"
            element={
              <ProtectedRoute>
                <ViewMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map-ranger"
            element={
              <MapRangerRoute>
                <MapRangerPanel />
              </MapRangerRoute>
            }
          />
          <Route
            path="/map-ranger/edit-point/:id"
            element={
              <MapRangerRoute>
                <EditPointLocation />
              </MapRangerRoute>
            }
          />
          <Route
            path="/map-ranger/users"
            element={
              <MapRangerRoute>
                <ManageUsers />
              </MapRangerRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


