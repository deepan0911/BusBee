import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BusSearch from "./pages/BusSearch";
import BusDetails from "./pages/BusDetails";
import SeatSelection from "./pages/SeatSelection";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminBuses from "./pages/admin/Buses";
import AdminBookings from "./pages/admin/Bookings";
import AdminUsers from "./pages/admin/Users";
import AdminRoutes from "./pages/admin/Routes";

// Google OAuth redirect handler
import GoogleSuccess from "./pages/GoogleSuccess";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<BusSearch />} />
            <Route path="/bus/:id" element={<BusDetails />} />
           <Route path="/google-success" element={<GoogleSuccess />} />


            {/* Protected User Routes */}
            <Route
              path="/select-seats/:id"
              element={
                <ProtectedRoute>
                  <SeatSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/:id"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-confirmation/:bookingId"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/buses"
              element={
                <AdminRoute>
                  <AdminBuses />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <AdminRoute>
                  <AdminBookings />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/routes"
              element={
                <AdminRoute>
                  <AdminRoutes />
                </AdminRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
