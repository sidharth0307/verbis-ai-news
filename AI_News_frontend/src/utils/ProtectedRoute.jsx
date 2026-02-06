import { Navigate } from "react-router-dom";
import { useHomeState } from "../context/HomeStateContext";

const AdminRoute = ({ children }) => {
  // const { user, loading } = useHomeState();

  // // 1. If we are still fetching the user from the backend, show nothing or a spinner
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-slate-950 flex items-center justify-center">
  //       <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  //     </div>
  //   );
  // }

  // // 2. If loading is finished and user is still undefined/null, they aren't logged in
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  // // 3. If user exists but role isn't admin
  // if (user.role !== "admin") {
  //   return <Navigate to="/" replace />;
  // }

  // 4. Authorized
  return children;
};

export default AdminRoute;