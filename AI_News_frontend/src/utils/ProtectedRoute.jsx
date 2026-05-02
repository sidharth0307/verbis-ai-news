import { Navigate } from "react-router-dom";
import { useHomeState } from "../context/HomeStateContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useHomeState();
  const token = localStorage.getItem("token");

  // 1. Critical: Handle loading so we don't redirect accidentally
  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin" || localStorage.getItem("role") === "admin";

  if (!token || !isAdmin) {
    console.warn("Unauthorized access attempt to Admin.");
    return <Navigate to="/" replace />;
  }

  // 2. FIX: Render children instead of Outlet
  return children; 
};

export default AdminRoute;